module.exports = function login(email, password) {
    cy.visit('/index.php?controller=authentication&back=my-account');
    cy.get('#login_form').within(form => {
        if(email && password) {
            cy.get('#email').type(email)
            cy.get('#passwd').type(password)
        }
        cy.get('#SubmitLogin > span').click()
    });
}