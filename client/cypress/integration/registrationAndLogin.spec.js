/* eslint-disable no-undef */

describe('Test Registration, login and delete', () => {
  it('user registers', () => {
    cy.visit('https://connexion-group5.herokuapp.com/signup');
    cy.get('#create-email-input').type('cypresstest@gmail.com');
    cy.get('#create-username-input').type('CypressTester');
    cy.get('#create-password-input').type('Cypress@123');
    cy.get(':nth-child(3) > .form-check-label').click();
    cy.get('.cancel-create-buttons > :nth-child(2)').click();

    // login successful, sent to login page
    cy.get('.loginbox').should('be.visible');

    // username is taken
    cy.visit('https://connexion-group5.herokuapp.com/signup');
    cy.get('#create-email-input').type('cypresstest@gmail.com');
    cy.get('#create-username-input').type('CypressTester');
    cy.get('#create-password-input').type('Cypress@123');
    cy.get(':nth-child(3) > .form-check-label').click();
    cy.get('.cancel-create-buttons > :nth-child(2)').click();
    cy.get('.fade').should('be.visible');

    // delete user
    cy.visit('https://connexion-group5.herokuapp.com/login');
    cy.get('#username-input').type('CypressTester');
    cy.get('#password-input').type('Cypress@123');
    cy.get(':nth-child(4) > :nth-child(1)').click();
    cy.get('#profile').click();
    cy.get('#edit-profile').click();
    cy.get('.btn-danger').click();
  });
});
