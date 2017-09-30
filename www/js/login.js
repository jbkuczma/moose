function showCreateAccountForm() {
    var confirmPasswordInput = document.getElementById('confirm_password_input');
    var createAccountButton = document.getElementById('createAccountButton');
    var submitButton = document.getElementById('login_form_button');
    var submitForm = document.getElementsByClassName('login_form')[0];
    var errorText = document.getElementById('errorText');

    errorText.style.display = 'none';
    confirmPasswordInput.style.display = 'block'; // reveal input for confirm password
    createAccountButton.style.display = 'none'; // hide the create account button
    submitButton.value = 'Create Account'; // change text in login button
    submitForm.action = '/account/create'; // change action of form 
}

;(function() {
    var errorText = document.getElementById('errorText');
    errorText.style.display = 'none';
    var hasError = window.location.search;
    var status = hasError.split('=')[1];
    if (status === 'failedLogin') {
        errorText.textContent = 'Login failed. Make sure your username and password are correct.';
        errorText.style.display = 'block';
    }
    else if (status === 'failedCreateAccount') {
        errorText.textContent = 'Account creation failed. The username you selected is taken.';
        errorText.style.display = 'block';
    }
})();