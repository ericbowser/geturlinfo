const request = require('supertest');
const express = require('express');
const app = require('../server'); // Adjust the path as necessary
const getUrlInfo = require('../getUrlInfo');
const {describe, jest, it} = require("@jest/globals");
const expect = require("expect");

jest.mock('../getUrlInfo');

describe('GET /api/getUrlInfo', () => {
    it('returns 200 and the links when getUrlInfo succeeds', async () => {
        const mockLinks = ['http://example.com'];
        getUrlInfo.mockResolvedValue({ links: mockLinks });

        const response = await request(app).get('/api/getUrlInfo').query({ param: 'http://test.com' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockLinks);
    });

    it('returns 500 and an error message when getUrlInfo throws an error', async () => {
        getUrlInfo.mockRejectedValue(new Error('Failed to fetch URL info'));

        const response = await request(app).get('/api/getUrlInfo').query({ param: 'http://test.com' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to fetch URL info' });
    });

    it('returns 400 when the param query is missing', async () => {
        const response = await request(app).get('/api/getUrlInfo').query({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Missing url parameter' });
    });
});