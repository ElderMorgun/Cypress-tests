describe('Account creation test', function () {

    before('Check the creation form visually', function () {
        cy.visit('/index.php?controller=authentication&back=my-account')
        cy.get('#create-account_form').matchImageSnapshot('createForm')
    });

    beforeEach('Go to authentication page and get user data', function () {
        cy.fixture('users').then(users => {
            this.user = users[1]
        })
        cy.visit('/index.php?controller=authentication&back=my-account')
        cy.get('.navigation_page').should('include.text', 'Authentication')
        cy.server()
        cy.route('POST', '/index.php').as('createAcc')
    });

    context('Check email errors', function () {

        beforeEach('Get list of wrong emails', function () {
            cy.fixture('negative').then(data => {
                this.wrongEmails = data.emails
            })
        });

        it('Submit the form without email', function () {
            cy.get('#SubmitCreate > span').click()
            cy.wait('@createAcc').then(xml => {
                expect(xml.status).to.eq(200)
                expect(xml.response.body.hasError).to.eq(true)
                expect(xml.response.body.errors[0]).to.include('Invalid email address.')
            })
            cy.get('#create_account_error')
                .should('be.visible')
                .and('include.text', 'Invalid email address.')
        });

        it('Submit the form with wrong email formats', function () {
            let wrongEmails = Object.values(this.wrongEmails)
            cy.wrap(wrongEmails).each(email => {
                cy.get('#email_create').clear().type(email)
                cy.get('#SubmitCreate > span').click()
                cy.wait('@createAcc').then(xml => {
                    expect(xml.status).to.eq(200)
                    expect(xml.response.body.hasError).to.eq(true)
                    expect(xml.response.body.errors[0]).to.include('Invalid email address.')
                })
                cy.get('#create_account_error')
                    .should('be.visible')
                    .and('include.text', 'Invalid email address.')
            });
        });

        it('Submit the form using existed email', function () {
            let existed = 'test@gmail.com'
            cy.get('#email_create').type(existed)
            cy.get('#SubmitCreate > span').click()
            cy.wait('@createAcc').then(xml => {
                expect(xml.status).to.eq(200)
                expect(xml.response.body.hasError).to.eq(true)
                expect(xml.response.body.errors[0]).to.include('An account using this email address has already been registered')
            })
            cy.get('#create_account_error')
                .should('be.visible')
                .and('include.text', 'An account using this email address has already been registered. Please enter a valid password or request a new one.')
        });
    });


    context('Check the full creation form', function () {

        beforeEach('Open the full form', function () {
            cy.get('#email_create').type(this.user.email)
            cy.get('#SubmitCreate > span').click();
            cy.wait('@createAcc').then(xml => {
                expect(xml.status).to.eq(200)
                expect(xml.response.body.hasError).to.eq(false)
            });
        });

        it('Check the creation form visually', function () {
            cy.location('href').should('include', 'http://automationpractice.com/index.php?controller=authentication&back=my-account#account-creation')
            cy.get('#account-creation_form').matchImageSnapshot('fullCreationForm')
        });


        it.only('Check error messages', function () {
            cy.get('#account-creation_form').should('be.visible').within(function (form) {
                cy.get('#submitAccount > span').click()
            });
            cy.get('.alert')
                .should('be.visible')
                .and('contain.text', '8 errors')
            cy.contains('You must register at least one phone number.').should('be.visible')
            cy.contains('lastname is required').should('be.visible')
            cy.contains('firstname is required.').should('be.visible')
            cy.contains('passwd is required.').should('be.visible')
            cy.contains('address1 is required.').should('be.visible')
            cy.contains('city is required.').should('be.visible')
            cy.contains(`The Zip/Postal code you've entered is invalid. It must follow this format: 00000`).should('be.visible')
            cy.contains('This country requires you to choose a State.').should('be.visible')

        });

        it('Create with email', function () {
            cy.get('#account-creation_form').should('be.visible').within(function (form) {
                cy.get('#email').then(email => expect(email[0].value).to.eq(this.user.email))
                cy.get('input[name="id_gender"]').each(gender => cy.get(gender).check())
                cy.get('#customer_firstname').type(this.user.name.split(' ')[0])
                cy.get('#customer_lastname').type(this.user.name.split(' ')[1])
                cy.get('#passwd').type(this.user.password)
                cy.get('#days').select(this.user.dateOfBirth.split('/')[0])
                cy.get('#months').select(this.user.dateOfBirth.split('/')[1])
                cy.get('#years').select(this.user.dateOfBirth.split('/')[2])
                cy.get('#firstname').type(this.user.name.split(' ')[0])
                cy.get('#lastname').type(this.user.name.split(' ')[1])
                cy.get('#company').type(this.user.company.name)
                cy.get('#address1').type(this.user.address.street)
                cy.get('#city').type(this.user.address.city)
                cy.get('#id_state').select(this.user.address.state)
                cy.get('#postcode').type(this.user.address.zipcode)
                cy.get('#id_country').select(this.user.address.country)
                cy.get('#phone_mobile').type(this.user.phone)
                cy.get('#alias').type('something')
            });
        });
    });
})