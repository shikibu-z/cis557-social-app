/* eslint-disable no-undef */
import 'cypress-file-upload';

describe('make a post', () => {
  it('user creates a post', () => {
    cy.visit('http://localhost:3000/login');
    // login
    cy.get('#username-input').type('CypressTest1');
    cy.get('#password-input').type('Cypress@123');
    cy.get(':nth-child(4) > :nth-child(1)').click();

    // create a group
    // cy.get('#createGroup').click();
    // cy.get('#btn-creategroup').click();
    // cy.get('#formHorizontalEmail').type('cypresstest');
    // cy.get('#formHorizontalPassword').type('cypress test');
    // cy.get('#inpTag').type('cytest');
    // cy.get('#add').click();
    // cy.get('.tags').should('be.visible');
    // cy.get('#imgInp').attachFile('tree.jpeg');
    // cy.get('.createGroupBtn').click();

    // create a post with image
    cy.get('.homepage-group').click();
    cy.get('#createBtn').click();
    cy.get('#inputPostTitle').type('cypress test post');
    cy.get('#inputPostContent').type('cypress test post content');
    cy.get('#imgBtn').attachFile('tree.jpeg');
    cy.get('#postBtn').click();
    cy.get('[style="border: medium none;"] > .card-header').should('be.visible');
  });
});
