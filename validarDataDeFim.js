function validarDataDeFim(executionContext) {
    const formContext =
        typeof executionContext.getFormContext === "function"
            ? executionContext.getFormContext()
            : executionContext;

    const dataDeFim = formContext.getAttribute("crm_datadefim")?.getValue();

    if (dataDeFim) {
        const turmaId = formContext.data.entity.getId()?.replace(/[{}]/g, "");

        if (!turmaId) {
            Xrm.Navigation.openAlertDialog({
                title: "❌ Erro",
                text: "Não foi possível verificar os dados da turma. Verifique o registro atual.",
            });
            return;
        }

        Xrm.Utility.showProgressIndicator("Validando históricos de alunos...");

        const fetchXml = `
            <fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">
                <entity name="crm_historicodoaluno">
                    <attribute name="crm_historicodoalunoid" />
                    <filter>
                        <condition attribute="crm_turma" operator="eq" value="${turmaId}" />
                        <condition attribute="crm_nota" operator="null" />
                    </filter>
                </entity>
            </fetch>
        `;

        const delayCloseProgressIndicator = (callback) => {
            setTimeout(() => {
                Xrm.Utility.closeProgressIndicator();
                callback();
            }, 1000); //atraso de 1 seg
        };

        Xrm.WebApi.online
            .retrieveMultipleRecords("crm_historicodoaluno", `?fetchXml=${encodeURIComponent(fetchXml)}`)
            .then((result) => {
                delayCloseProgressIndicator(() => {
                    if (result.entities.length > 0) {
                        Xrm.Navigation.openAlertDialog({
                            title: "❌ Erro",
                            text: "Não é possível adicionar uma Data de Fim na turma enquanto houver algum histórico sem nota.",
                        });

                        formContext.getAttribute("crm_datadefim").setValue(null);
                    }
                });
            })
            .catch((error) => {
                delayCloseProgressIndicator(() => {
                    Xrm.Navigation.openAlertDialog({
                        title: "❌ Erro ao Validar Históricos",
                        text: `Ocorreu um erro ao verificar os históricos da turma: ${error.message}`,
                    });
                });
            });
    }
}
