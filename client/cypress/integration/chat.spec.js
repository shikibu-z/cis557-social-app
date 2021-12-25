/* eslint-disable no-undef */
describe('make a post', () => {
  it('user creates a post', () => {
    cy.visit('https://connexion-group5.herokuapp.com/login');
    // login
    cy.get('#username-input').type('lejuser02');
    cy.get('#password-input').type('Lejuser02!');
    cy.get(':nth-child(4) > :nth-child(1)').click();

    // go to chats
    cy.get(':nth-child(1) > .homepage-friend').click();

    // enter message
    cy.get('#chat-page-input-body').type('hello world');
    cy.get('#send-message').click();

    // message sent
    cy.get('.messages').children().last().should('have.text', 'hello world');
  });
});
