
    using Microsoft.Xrm.Sdk;
    using Microsoft.Xrm.Sdk.Query;
    using System;

namespace Plugins_Academia
{
    public class PreventUpdateDateIfMissingGrades : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity target)
            {
                if (context.MessageName == "Update" && target.LogicalName == "crm_turma" && target.Contains("crm_datadefim"))
                {
                    ValidateTurmaEndDate(service, target.Id, target);
                }

                if (context.MessageName == "Update" && target.LogicalName == "crm_historicodoaluno" && target.Contains("crm_nota"))
                {
                    if (target.Attributes["crm_nota"] == null)
                    {
                        Guid turmaId = GetRelatedTurmaId(service, target.Id);
                        if (turmaId != Guid.Empty)
                        {
                            Entity turma = service.Retrieve("crm_turma", turmaId, new ColumnSet("crm_datadefim"));
                            ValidateTurmaEndDate(service, turmaId, turma);
                        }
                    }
                }
            }
        }

        private void ValidateTurmaEndDate(IOrganizationService service, Guid turmaId, Entity turma)
        {
            if (!turma.Contains("crm_datadefim") || turma["crm_datadefim"] == null)
            {
                return;
            }

            QueryExpression query = new QueryExpression("crm_historicodoaluno")
            {
                ColumnSet = new ColumnSet("crm_nota"),
                Criteria = new FilterExpression
                {
                    Conditions =
                {
                    new ConditionExpression("crm_turma", ConditionOperator.Equal, turmaId)
                }
                }
            };

            EntityCollection historicos = service.RetrieveMultiple(query);

            foreach (Entity historico in historicos.Entities)
            {
                if (!historico.Contains("crm_nota") || historico["crm_nota"] == null)
                {
                    throw new InvalidPluginExecutionException("Não é possível concluir ou alterar históricos de uma turma com Data de Fim enquanto houver históricos sem nota.");
                }
            }
        }

        private Guid GetRelatedTurmaId(IOrganizationService service, Guid historicoId)
        {
            Entity historico = service.Retrieve("crm_historicodoaluno", historicoId, new ColumnSet("crm_turma"));
            if (historico != null && historico.Contains("crm_turma"))
            {
                return historico.GetAttributeValue<EntityReference>("crm_turma").Id;
            }

            return Guid.Empty;
        }
    }

}
