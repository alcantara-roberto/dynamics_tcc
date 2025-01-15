async function chamarFluxoConclusao(executionContext) {
    const formContext =
        typeof executionContext.getFormContext === "function"
            ? executionContext.getFormContext()
            : executionContext;

    const dataCampo = formContext.getAttribute("crm_datadefim")?.getValue();
    if (!dataCampo) {
        Xrm.Utility.closeProgressIndicator();
        Xrm.Navigation.openAlertDialog({
            title: "❌ Erro",
            text: "Preencha o campo Data De Fim antes de enviar os e-mails.",
        });
        return;
    }

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

    const entityIdFormatado = entityId.replace(/[{}]/g, "");

    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(entityIdFormatado)) {
        Xrm.Utility.closeProgressIndicator();
        Xrm.Navigation.openAlertDialog({
            title: "❌ Erro",
            text: "ID da entidade inválido. Verifique o registro atual.",
        });
        return;
    }

    Xrm.Utility.showProgressIndicator("Enviando emails de conclusão...");

    let contacts;
    try {
        const fetchXml = `
            <fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">
                <entity name="contact">
                    <attribute name="contactid" />
                    <attribute name="firstname" />
                    <attribute name="lastname" />
                    <attribute name="emailaddress1" />
                    <link-entity name="crm_historicodoaluno" from="crm_aluno" to="contactid" alias="historico">
                        <attribute name="crm_nota" />
                        <filter>
                            <condition attribute="crm_turma" operator="eq" value="${entityIdFormatado}" />
                        </filter>
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

    const contatosSemNota = contacts.entities.filter(
        contact => !contact["historico.crm_nota"]
    );

    if (contatosSemNota.length > 0) {
        Xrm.Utility.closeProgressIndicator();
        Xrm.Navigation.openAlertDialog({
            title: "❌ Erro",
            text: "Impossível enviar email de conclusão sem o fechamento do histórico de todos os alunos da turma!",
        });
        return;
    }

    const data = {
        turma: turma,
        turmaId: entityIdFormatado,
        contatos: contacts.entities
            .filter(contact => contact.firstname && contact.lastname && contact.emailaddress1)
            .map(contact => ({
                nome: contact.firstname,
                sobrenome: contact.lastname,
                email: contact.emailaddress1,
                nota: contact["historico.crm_nota"] || "Sem nota registrada",
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
            "https://prod-03.brazilsouth.logic.azure.com:443/workflows/6fe6de822640479bac75a3b09bc15248/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fRsI09vgxWlPTHwE-bF1L5bxkKlBexub827oPYQ1OYs",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            throw new Error("Erro na solicitação: Bad Request");
        }

        const responseData = await response.json();
        if (responseData.success === true) {
            Xrm.Utility.closeProgressIndicator();
            Xrm.Navigation.openAlertDialog({
                title: "✅ Sucesso",
                text: "Emails de conclusão enviados com sucesso!",
            });

            formContext.getAttribute("crm_emailconclusao")?.setValue(true);
            formContext.data.entity.save();
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
            text: "Impossível enviar email de conclusão sem o fechamento do histórico de todos os alunos da turma!",
        });
    } finally {
        Xrm.Utility.closeProgressIndicator();
    }
}
