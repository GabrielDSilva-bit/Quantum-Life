// src/public/js/alterar-senha.js

document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.getElementById('changePasswordForm');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    // Elementos para feedback de requisitos de senha
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqSpecial = document.getElementById('req-special');

    // Função para validar a nova senha em tempo real
    newPasswordInput.addEventListener('keyup', () => {
        const newPassword = newPasswordInput.value;

        // Verifica pelo menos 8 caracteres
        if (newPassword.length >= 8) {
            reqLength.classList.add('checked');
        } else {
            reqLength.classList.remove('checked');
        }

        // Verifica se há pelo menos uma letra maiúscula
        if (/[A-Z]/.test(newPassword)) {
            reqUppercase.classList.add('checked');
        } else {
            reqUppercase.classList.remove('checked');
        }

        // Verifica se há pelo menos um caractere especial (#?!&.@)
        if (/[#?!&.@]/.test(newPassword)) {
            reqSpecial.classList.add('checked');
        } else {
            reqSpecial.classList.remove('checked');
        }
    });

    changePasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Verifica se as senhas coincidem
        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Senhas não coincidem',
                text: 'A nova senha e a confirmação da senha não coincidem.'
            });
            return;
        }

        // Verifica requisitos da nova senha
        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[#?!&.@]/.test(newPassword)) {
            Swal.fire({
                icon: 'warning',
                title: 'Senha fraca',
                text: 'A nova senha não atende a todos os requisitos de segurança.'
            });
            return;
        }

        // Verifica se o usuário está logado
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

        // Envia a solicitação para o backend
        try {
            const response = await fetch('/api/alterar-senha', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Senha alterada com sucesso!',
                    text: data.message
                }).then(() => {
                    window.location.href = '/perfil';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao alterar senha',
                    text: data.message || 'Erro inesperado ao tentar alterar a senha.'
                });
            }
        } catch (error) {
            console.error('Erro de rede ao alterar senha:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro de conexão',
                text: 'Erro de conexão ao tentar alterar a senha.'
            });
        }
    });
});
