describe('Sign in test', function () {

    before('Check the sign in form visually', function() {
        cy.visit('/index.php?controller=authentication&back=my-account')
        cy.get('#login_form').matchImageSnapshot('login')
    })

    beforeEach('Get user credentials', function () {
        cy.fixture('users').then(users => {
            this.user = users[0]
        })
    });

    context('Check error messages', function () {

        it('Login is using empty fields', function() {
            cy.login();
            cy.contains('An email address required.')
            .should('be.visible');
        });

        it('Login is using unregistered email', function() {
            cy.login('unregistered@cypress.io', this.user.password);
            cy.contains('Authentication failed.')
            .should('be.visible');
        });

        it('Login is using wrong password', function() {
            cy.login(this.user.email, (this.user.password).toUpperCase());
            cy.contains('Authentication failed.')
            .should('be.visible');
        });

        it('Login is using only username as email', function() {
            cy.login(this.user.email.split('@')[0], this.user.password);
            cy.contains('Invalid email address.')
            .should('be.visible');
        });

    });

    context('Sign in the account', function() {

        beforeEach('Clear local storage', function() {
            cy.clearCookies();
            cy.clearLocalStorage();
        });

        it('Login is using lower/upper case email format', function() {
            cy.login((this.user.email).toUpperCase(), this.user.password);
        });

        it('Successful login', function() {
            cy.login(this.user.email, this.user.password)
        });

        afterEach('Check login a successful', function() {
            cy.get('.navigation_page').should('include.text', 'My account')
            cy.get('.account > span').should('include.text', this.user.name)
            cy.get('.info-account').should('include.text', 'Welcome to your account. Here you can manage all of your personal information and orders.')
        });

    });

});