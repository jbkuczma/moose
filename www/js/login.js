function showCreateAccountForm() {
    var confirmPasswordInput = document.getElementById('confirm_password_input')
    var createAccountButton = document.getElementById('createAccountButton')
    var submitButton = document.getElementById('login_form_button')

    confirmPasswordInput.style.display = 'block' // reveal input for confirm password
    createAccountButton.style.display = 'none' // hide the create account button
    submitButton.value = 'Create Account' // change text in login button
    
}