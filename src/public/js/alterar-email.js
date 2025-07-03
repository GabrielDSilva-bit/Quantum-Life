document.addEventListener('DOMContentLoaded', () => {
    const changeEmailForm = document.getElementById('changeEmailForm');
    const newEmailInput = document.getElementById('new-email');
    const confirmEmailInput = document.getElementById('confirm-email');

    changeEmailForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const newEmail = newEmailInput.value;
        const confirmEmail = confirmEmailInput.value;

        // Validação: e-mails devem ser iguais
        if (newEmail !== confirmEmail) {
            Swal.fire({
                icon: 'error',
                title: 'E-mails diferentes',
                text: 'O novo e-mail e a confirmação não coincidem.'
            });
            return;
        }

        // Validação: formato básico de e-mail
        if (!newEmail.includes('@') || !newEmail.includes('.')) {
            Swal.fire({
                icon: 'warning',
                title: 'E-mail inválido',
                text: 'Por favor, insira um e-mail válido.'
            });
            return;
        }

        // Verifica se está logado
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Sessão expirada',
                text: 'Você não está logado. Por favor, faça login novamente.'
            }).then(() => {
                window.location.href = '/login-cadastro';
            });
            return;
        }

        try {
            const response = await fetch('/api/alterar-email', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newEmail })
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'E-mail alterado com sucesso!',
                    text: data.message
                }).then(() => {
                    window.location.href = '/perfil';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: data.message || 'Erro ao alterar o e-mail.'
                });
            }
        } catch (error) {
            console.error('Erro de rede ao alterar e-mail:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro de conexão',
                text: 'Erro de conexão ao tentar alterar o e-mail.'
            });
        }
    });
});
