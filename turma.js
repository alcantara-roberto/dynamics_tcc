async function chamarFluxoPowerAutomate(executionContext) {
  const formContext =
      typeof executionContext.getFormContext === "function"
          ? executionContext.getFormContext()
          : executionContext;

  let turma = formContext.getAttribute("crm_codigo")?.getValue();
  const entityId = formContext.data.entity.getId();

  if (!entityId) {
      Xrm.Utility.closeProgressIndicator();
      Xrm.Navigation.openAlertDialog({
          title: "❌ Erro",
          text: "Não foi possível obter o ID da entidade. Verifique o registro atual.",
      });
      return;
  }

  Xrm.Utility.showProgressIndicator("Enviando emails de boas-vindas...");
  const entityIdFormatado = entityId.replace(/[{}]/g, "");

  let contacts;
  try {
      const fetchXml = `
          <fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">
              <entity name="contact">
                  <attribute name="contactid" />
                  <attribute name="lastname" />
                  <attribute name="firstname" />
                  <attribute name="emailaddress1" />
                  <order attribute="lastname" descending="false" />
                  <link-entity name="crm_turma_aluno" from="contactid" to="contactid" visible="false" intersect="true">
                      <link-entity name="crm_turma" from="crm_turmaid" to="crm_turmaid" alias="aa">
                          <filter type="and">
                              <condition attribute="crm_turmaid" operator="eq" value="${entityIdFormatado}" />
                          </filter>
                      </link-entity>
                  </link-entity>
              </entity>
          </fetch>
      `;

      contacts = await Xrm.WebApi.online.retrieveMultipleRecords(
          "contact",
          `?fetchXml=${encodeURIComponent(fetchXml)}`
      );
  } catch (error) {
      Xrm.Utility.closeProgressIndicator();
      Xrm.Navigation.openAlertDialog({
          title: "❌ Erro ao Buscar Contatos",
          text: `Erro ao buscar contatos: ${error.message}`,
      });
      return;
  }

  const data = {
      turma: turma,
      turmaId: entityIdFormatado,
      contatos: contacts.entities
          .filter(
              (contact) =>
                  contact.firstname && contact.lastname && contact.emailaddress1
          )
          .map((contact) => ({
              nome: contact.firstname,
              sobrenome: contact.lastname,
              email: contact.emailaddress1,
          })),
  };

  if (data.contatos.length === 0) {
      Xrm.Utility.closeProgressIndicator();
      Xrm.Navigation.openAlertDialog({
          title: "❌ Erro",
          text: "Nenhum contato relacionado encontrado.",
      });
      return;
  }

  try {
      const response = await fetch(
          "https://prod-28.brazilsouth.logic.azure.com:443/workflows/96d1721888c34030b492b751f7c25b0d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YprKkTp0C655ZhAhBcuI9EKs1rdNn1eR_0ORiv8syLA",
          {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
          }
      );

      if (!response.ok) {
          throw new Error(`Erro na solicitação: ${response.statusText}`);
      }

      const responseData = await response.json();
      if (responseData.success === true) {
          Xrm.Utility.closeProgressIndicator();
          Xrm.Navigation.openAlertDialog({
              title: "✅ Sucesso",
              text: "Emails de boas-vindas enviados com sucesso!",
          });
      } else {
          Xrm.Utility.closeProgressIndicator();
          Xrm.Navigation.openAlertDialog({
              title: "❌ Erro no Power Automate",
              text: responseData.message,
          });
      }
  } catch (error) {
      Xrm.Utility.closeProgressIndicator();
      Xrm.Navigation.openAlertDialog({
          title: "❌ Erro ao Processar Solicitação",
          text: `Erro ao enviar os emails: ${error.message}`,
      });
  } finally {
      Xrm.Utility.closeProgressIndicator();
  }
}
