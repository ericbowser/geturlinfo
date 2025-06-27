import request from 'supertest';
import * as app from '../server'; // Adjust the path as necessary
import {describe, jest, it, expect} from "@jest/globals";

jest.useFakeTimers();
jest.mock('../getUrlInfo');

describe('get url info endpoint', () => {
    it.only('returns 200 and the links when getUrlInfo succeeds', async () => {
        const mockLinks = ['http://example.com'];
        // getUrlInfo.mockResolvedValue({ links: mockLinks });

        const response = await request(app).get('/api/getUrlInfo').query({ param: 'http://test.com' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockLinks);
    });

    // it('returns 500 and an error message when getUrlInfo throws an error', async () => {
    //     // getUrlInfo.mockRejectedValue(new Error('Failed to fetch URL info'));
    //
    //     // const response = await request(app).get('/api/getUrlInfo').query({ param: 'http://test.com' });
    //
    //     expect(response.status).toBe(500);
    //     expect(response.body).toEqual({ error: 'Failed to fetch URL info' });
    // });
    //
    // it('returns 400 when the param query is missing', async () => {
    //     const response = await request(app).get('/api/getUrlInfo').query({});
    //
    //     expect(response.status).toBe(400);
    //     expect(response.body).toEqual({ error: 'Missing url parameter' });
    // });
});