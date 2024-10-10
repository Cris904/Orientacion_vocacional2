function handlePrivacyCheckbox() {
    var checkbox = document.getElementById("terms");
    var submitBtn = document.getElementById("submitBtn");
    var privacyAccepted = document.getElementById("privacyAccepted");

    if (checkbox.checked && grecaptcha.getResponse()) {
        submitBtn.disabled = false;
        privacyAccepted.value = "accepted";
    } else {
        submitBtn.disabled = true;
        privacyAccepted.value = "";
    }
}

function recaptchaCallback() {
    handlePrivacyCheckbox();
}

function validateForm(event) {
    var isValid = true;

    var firstName = document.getElementById("id_first_name").value.trim();
    var lastName = document.getElementById("id_last_name").value.trim();
    var username = document.getElementById("id_username").value.trim();
    var email = document.getElementById("id_email").value.trim();
    var password = document.getElementById("id_password1").value.trim();
    var confirmPassword = document.getElementById("id_password2").value.trim();

    if (firstName === "") {
        document.getElementById("id_first_name").setCustomValidity("El nombre es obligatorio.");
        isValid = false;
    } else {
        document.getElementById("id_first_name").setCustomValidity("");
    }

    if (lastName === "") {
        document.getElementById("id_last_name").setCustomValidity("Los apellidos son obligatorios.");
        isValid = false;
    } else {
        document.getElementById("id_last_name").setCustomValidity("");
    }

    if (username === "") {
        document.getElementById("id_username").setCustomValidity("El nombre de usuario es obligatorio.");
        isValid = false;
    } else {
        document.getElementById("id_username").setCustomValidity("");
    }

    if (email === "") {
        document.getElementById("id_email").setCustomValidity("El correo es obligatorio.");
        isValid = false;
    } else {
        document.getElementById("id_email").setCustomValidity("");
    }

    if (password === "") {
        document.getElementById("id_password1").setCustomValidity("La contraseña es obligatoria y debe tener al menos 8 caracteres.");
        isValid = false;
    } else if (password.length < 8) {
        document.getElementById("id_password1").setCustomValidity("La contraseña debe tener al menos 8 caracteres.");
        isValid = false;
    } else if (/^\d+$/.test(password)) {
        document.getElementById("id_password1").setCustomValidity("La contraseña no puede ser solo numérica.");
        isValid = false;
    } else {
        document.getElementById("id_password1").setCustomValidity("");
    }

    if (confirmPassword === "") {
        document.getElementById("id_password2").setCustomValidity("Las contraseñas no coinciden.");
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById("id_password2").setCustomValidity("Las contraseñas no coinciden.");
        isValid = false;
    } else {
        document.getElementById("id_password2").setCustomValidity("");
    }

    // Clear custom validity messages on input
    document.getElementById("id_first_name").addEventListener("input", function() {
        this.setCustomValidity("");
    });
    document.getElementById("id_last_name").addEventListener("input", function() {
        this.setCustomValidity("");
    });
    document.getElementById("id_username").addEventListener("input", function() {
        this.setCustomValidity("");
    });
    document.getElementById("id_email").addEventListener("input", function() {
        this.setCustomValidity("");
    });
    document.getElementById("id_password1").addEventListener("input", function() {
        this.setCustomValidity("");
    });
    document.getElementById("id_password2").addEventListener("input", function() {
        this.setCustomValidity("");
    });

    if (!isValid) {
        event.preventDefault();
    }
    return isValid;
}