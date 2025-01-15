# Dynamics 365

O projeto TCC - Dynamics utiliza a plataforma Dynamics da Microsoft para provisionar um conjunto integrado de aplicativos de planejamento de recursos corporativos (ERP) e gerenciamento de relacionamento com o cliente (CRM).

## Instruções para sua execução

1. acesse a plataforma a seguir por meio do login em anexo:
    ```bash
    https://make.powerapps.com/
    ```

2. No canto superior direito, será possível selecionar o ambiente, sendo o "Minsait TCC" o ambiente de Sales, e "Marketing Trial" o ambiente de Insight Marketing.

![image](https://github.com/user-attachments/assets/35a28e6b-001d-4180-815c-ea802807dccd)

3. No ambiente Minsait TCC, na aba "Soluções", poderemos acessar o sistema localizado dentro de soluções Gerenciadas, com nome "Solution":

   ![image](https://github.com/user-attachments/assets/afb191fd-4da7-4e69-a1e8-b08fe8e15c78)


4. Após acessar, terá acesso aos recursos e entidades do sistema, portanto para acessar o ambiente de testes "Avaliação do Sales, clique na aba de aplicativos na esquerda da página:

  ![image](https://github.com/user-attachments/assets/aa139833-f7b7-46b6-ae1b-ccc23d4e3b5e)


5. Aqui terá uma versão resumida da visão do usuário, bem como sua interação com a plataforma, por meio de um painel de acordo com a proposta dos objetivos a serem atingidos durante o projeto:

![image](https://github.com/user-attachments/assets/f82c0bf7-505e-48ea-9853-91f65b57b39e)


6. Ao acessar a aba Turma, teremos exemplos de turmas recém-criadas, sendo as quatro primeiras já finalizadas:

![image](https://github.com/user-attachments/assets/eee5058c-cc75-4aee-b214-32776208a51b)


7. Turma 15: Exemplo de turma com todos os alunos com suas notas devidamente preenchidas, porém sem a data de conclusão, gerando um erro ao tentar enviar o Email de Conclusão:



8. Turma 16: Exemplo de turma com o primeiro aluno com ausência de nota, gerando erro ao tentar inserir a Data de Fim:

![image](https://github.com/user-attachments/assets/5811e095-c9c3-4818-bf9e-bd1094dc52ea)


9. Turma 17: Exemplo de turma com a Data de Fim preenchida, porém com a ausência da nota do primeiro aluno, gerando um erro ao tentar enviar o Email de Conclusão:



10. Turma 18: Exemplo de turma em andamento, para exemplo de envio de Email de Boas Vindas:



11. Tela de Cursos:

![image](https://github.com/user-attachments/assets/1a651b3c-8fe4-4b75-86b2-bc0abaa818a0)


12. Tela de Contas de empresas:

![image](https://github.com/user-attachments/assets/e841ef3f-c4cd-4d89-8e27-247e909bf913)


13. Tela de Contatos:

![image](https://github.com/user-attachments/assets/358fbef9-61cc-462f-bbdc-ee7c67ecd22c)


14. Preview de uma página dentro do ambiente "Marketing" no aplicativo Customer Insights - Journeys:

    ![image](https://github.com/user-attachments/assets/9b8a3826-3dd9-489c-8fe9-52616cd76aaf)


## Informações sobre os arquivos

- O arquivo `turma.js` provisiona a função "chamarFluxoPowerAutomate" para gatilho de envio de email de Boasvindas na Turma, bem como alimentar as mensagens do respectivo botão.
- O arquivo `turmaconclusao.js` provisiona a função "chamarFluxoConclusao" para gatilho de envio de email de Conclusão na Turma, bem como alimentar as mensagens do respectivo botão.
- O arquivo `validar.js` valida o CPF, como também realiza sua formatação.
- O arquivo `validarDataDeFim.js` valida as regras para conclusão de uma turma, evitando a ausência de alguma nota no histórico.
- O arquivo `ContatoPreOperationCreateSync.cs` Plugin necessário para verificar a operação do tipo Create do CPF, vinculado ao devido Contato, evitando duplicidades.
- O arquivo `ContatoPreOperationUpdateSync.cs` Plugin necessário para verificar a operação do tipo Update do CPF, vinculado ao devido Contato, evitando duplicidades.
- O arquivo `PrevetionTurmaCompletionDate.cs` Plugin necessário para evitar atualizações indevidas de Datas de Fim em Turmas e Históricos sem Nota.
