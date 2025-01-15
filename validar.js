var Treinamento = Treinamento || {};
Treinamento.Validacao = {
    ValidarCpf: function (executionContext) {
        var formContext = executionContext.getFormContext();
        var cpf = formContext.getAttribute('crm_cpf').getValue();
        if (!cpf) {
            formContext.getControl('crm_cpf').setNotification('O CPF nao pode ser vazio');
            return false;
        }
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1*$/.test(cpf)) {
            formContext.getControl('crm_cpf').setNotification('CPF invalido.');
            return false;
        }
 
        var soma = 0;
        for (var i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        var resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) {
            formContext.getControl('crm_cpf').setNotification('CPF invÃ¡lido');
            return false;
        }
 
        soma = 0;
        for (var i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) {
            formContext.getControl('crm_cpf').setNotification('CPF invÃ¡lido');
            return false;
        }
 
        formContext.getControl('crm_cpf').clearNotification();
        var cpfFormatado = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        formContext.getAttribute('crm_cpf').setValue(cpfFormatado);
        return true;
    }
};