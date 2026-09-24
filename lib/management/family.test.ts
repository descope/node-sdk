import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { CustomAttribute, Family, FamilySettings, UpdateJWTResponse } from './types';
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

const mockCustomAttributes: CustomAttribute[] = [{ name: 'attr1', type: 1 }];

const mockFamilySettings: FamilySettings = {
  enabled: true,
  maxFamilyMembers: 5,
  allowMultipleFamiliesUsers: false,
};

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

  describe('getSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFamilySettings,
        clone: () => ({
          json: () => Promise.resolve(mockFamilySettings),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<FamilySettings> = await management.family.getSettings();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.family.settings);

      expect(resp).toEqual({
        code: 200,
        data: mockFamilySettings,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('setSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFamilySettings,
        clone: () => ({
          json: () => Promise.resolve(mockFamilySettings),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<FamilySettings> = await management.family.setSettings(
        mockFamilySettings,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.family.settings,
        mockFamilySettings,
      );

      expect(resp).toEqual({
        code: 200,
        data: mockFamilySettings,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('getCustomAttributes', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ data: mockCustomAttributes }),
        clone: () => ({
          json: () => Promise.resolve({ data: mockCustomAttributes }),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<CustomAttribute[]> = await management.family.getCustomAttributes();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.family.getCustomAttributes);

      expect(resp).toEqual({
        code: 200,
        data: mockCustomAttributes,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('createCustomAttributes', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ data: mockCustomAttributes }),
        clone: () => ({
          json: () => Promise.resolve({ data: mockCustomAttributes }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<CustomAttribute[]> = await management.family.createCustomAttributes(
        mockCustomAttributes,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.family.createCustomAttributes, {
        attributes: mockCustomAttributes,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockCustomAttributes,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteCustomAttributes', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ data: [] }),
        clone: () => ({
          json: () => Promise.resolve({ data: [] }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<CustomAttribute[]> = await management.family.deleteCustomAttributes([
        'attr1',
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.family.deleteCustomAttributes, {
        names: ['attr1'],
      });

      expect(resp).toEqual({
        code: 200,
        data: [],
        ok: true,
        response: httpResponse,
      });
    });
  });
});
