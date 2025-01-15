using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Plugins_Academia
{
    public class ContatoPreOperationUpdateSync : IPlugin
    {

        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var crmService = serviceFactory.CreateOrganizationService(context.UserId);
            var trace = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            trace.Trace("Início Plugin");

            if (context.MessageName.ToLower() == "update"
                && context.Mode == Convert.ToInt32(MeuEnum.Mode.Synchronous)
                && context.Stage == Convert.ToInt32(MeuEnum.Stage.PreOperation)
                )
            {
                Entity entidadeContexto = null;

                if (context.InputParameters.Contains("Target"))
                    entidadeContexto = (Entity)context.InputParameters["Target"];

                if (entidadeContexto != null)
                {
                    if (entidadeContexto.Attributes.ContainsKey("crm_cpf"))
                    {
                        var cpfContexto = entidadeContexto.Attributes["crm_cpf"].ToString();
                        var idContexto = entidadeContexto.Attributes["contactid"].ToString();
                        trace.Trace($"CPF do contexto: {cpfContexto}");

                        var query = new QueryExpression("contact");

                        query.TopCount = 1;

                        query.ColumnSet.AddColumns("firstname", "lastname", "crm_cpf");

                        query.Criteria.AddCondition("crm_cpf", ConditionOperator.Equal, cpfContexto);

                        query.Criteria.AddCondition("contactid", ConditionOperator.NotEqual, idContexto);

                        var colecaoEntidades = crmService.RetrieveMultiple(query);
                        if (colecaoEntidades.Entities.Count > 0)
                            throw new InvalidPluginExecutionException("CPF já cadastrado!");
                    }
                }
            }

            trace.Trace("Fim Plugin");
        }
    }
}