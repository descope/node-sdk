import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { Family, UpdateJWTResponse } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

const mockFamily: Family = {
  id: 'f1',
  name: 'family1',
  customAttributes: { customAttr: 'value' },
  disabled: false,
  photo: 'http://dummy.com/photo.png',
  createdTime: 1,
};

const mockFamilies: Family[] = [
  mockFamily,
  { id: 'f2', name: 'family2', createdTime: 1 },
  { id: 'f3', name: 'family3', createdTime: 1 },
];

const mockUserResponse = {
  userId: 'u1',
  loginIds: ['lid'],
  verifiedEmail: false,
  verifiedPhone: false,
};

describe('Management Family', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('create', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ family: mockFamily }),
        clone: () => ({
          json: () => Promise.resolve({ family: mockFamily }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Family> = await management.family.create(
        'family1',
        { customAttr: 'value' },
        'http://dummy.com/photo.png',
        false,
        'f1',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.family.create, {
        name: 'family1',
        customAttributes: { customAttr: 'value' },
        photo: 'http://dummy.com/photo.png',
        disabled: false,
        familyId: 'f1',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockFamily,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('update', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ family: mockFamily }),
        clone: () => ({
          json: () => Promise.resolve({ family: mockFamily }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Family> = await management.family.update(
        'f1',
        'family1',
        { customAttr: 'value' },
        'http://dummy.com/photo.png',
        false,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.family.update, {
        id: 'f1',
        name: 'family1',
        customAttributes: { customAttr: 'value' },
        photo: 'http://dummy.com/photo.png',
        disabled: false,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockFamily,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('delete', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.family.delete('f1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.family.delete, { id: 'f1' });

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('search', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ families: mockFamilies }),
        clone: () => ({
          json: () => Promise.resolve({ families: mockFamilies }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Family[]> = await management.family.search({
        familyIds: ['f1'],
        freeText: 'fam',
        familyNames: ['family1'],
        page: 0,
        size: 10,
        customAttributes: { customAttr: 'value' },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.family.search,
        {
          familyIds: ['f1'],
          freeText: 'fam',
          familyNames: ['family1'],
          page: 0,
          size: 10,
          customAttributes: { customAttr: 'value' },
        },
        {},
      );

      expect(resp).toEqual({
        code: 200,
        data: mockFamilies,
        ok: true,
        response: httpResponse,
      });
    });

    it('should send an empty body when called without options', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ families: mockFamilies }),
        clone: () => ({
          json: () => Promise.resolve({ families: mockFamilies }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      await management.family.search();

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.family.search, {}, {});
    });
  });

  describe('createDependent', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ user: mockUserResponse }),
        clone: () => ({
          json: () => Promise.resolve({ user: mockUserResponse }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.family.createDependent('f1', {
        name: 'dependent',
        email: 'dependent@example.com',
        familyScopedAttributes: { f1: { customAttr: 'value' } },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.family.dependent.create, {
        familyId: 'f1',
        name: 'dependent',
        email: 'dependent@example.com',
        familyScopedAttributes: { f1: { customAttr: 'value' } },
      });

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteDependent', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.family.deleteDependent('u1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.family.dependent.delete, {
        userId: 'u1',
      });

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('impersonateDependent', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ jwt: 'jwt123' }),
        clone: () => ({
          json: () => Promise.resolve({ jwt: 'jwt123' }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UpdateJWTResponse> = await management.family.impersonateDependent(
        'admin-uid',
        'dependent-lid',
        'f1',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.family.impersonate, {
        impersonatorUserIdOrLoginId: 'admin-uid',
        dependentLoginId: 'dependent-lid',
        selectedFamily: 'f1',
      });

      expect(resp).toEqual({
        code: 200,
        data: { jwt: 'jwt123' },
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('stopImpersonation', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ jwt: 'jwt123' }),
        clone: () => ({
          json: () => Promise.resolve({ jwt: 'jwt123' }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UpdateJWTResponse> = await management.family.stopImpersonation(
        'jwt123',
        { k: 'v' },
        60,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.family.stopImpersonation, {
        jwt: 'jwt123',
        customClaims: { k: 'v' },
        refreshDuration: 60,
      });

      expect(resp).toEqual({
        code: 200,
        data: { jwt: 'jwt123' },
        ok: true,
        response: httpResponse,
      });
    });
  });
});
