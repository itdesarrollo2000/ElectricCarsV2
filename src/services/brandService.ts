import api from './api';
import type { Brand, BrandRequest, BrandFilters, PaginatedResponse, BrandAddress, BrandAddressRequest } from '../types';

export const brandService = {
  // Get all brands with pagination
  getBrands: async (filters?: BrandFilters): Promise<PaginatedResponse<Brand>> => {
    const params = new URLSearchParams();
    if (filters?.pageSize) params.append('PageSize', filters.pageSize.toString());
    if (filters?.pageNumber) params.append('PageNumber', filters.pageNumber.toString());

    const response = await api.get<PaginatedResponse<Brand>>(`/Brands/GetBrands?${params}`);
    return response.data;
  },

  // Get brand by ID
  getBrandById: async (id: number): Promise<Brand> => {
    const response = await api.get(`/Brands/GetById?id=${id}`);
    // La API puede devolver { data: Brand } o directamente Brand
    return response.data?.data || response.data;
  },

  // Add new brand
  addBrand: async (brand: BrandRequest): Promise<Brand> => {
    const formData = new FormData();
    formData.append('BrandName', brand.brandName);
    if (brand.brandLogo) formData.append('BrandLogo', brand.brandLogo);
    if (brand.adressLine) formData.append('AdressLine', brand.adressLine);
    if (brand.brandPhone) formData.append('BrandPhone', brand.brandPhone);
    if (brand.contactName) formData.append('ContactName', brand.contactName);
    if (brand.contactPhone) formData.append('ContactPhone', brand.contactPhone);

    const response = await api.post<Brand>('/Brands/AddBrand', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update brand
  updateBrand: async (brandId: number, brand: Partial<BrandRequest>): Promise<Brand> => {
    const formData = new FormData();
    formData.append('BrandId', brandId.toString());
    if (brand.brandName) formData.append('BrandName', brand.brandName);
    if (brand.brandLogo) formData.append('BrandLogo', brand.brandLogo);
    if (brand.adressLine) formData.append('AdressLine', brand.adressLine);
    if (brand.brandPhone) formData.append('BrandPhone', brand.brandPhone);
    if (brand.contactName) formData.append('ContactName', brand.contactName);
    if (brand.contactPhone) formData.append('ContactPhone', brand.contactPhone);

    const response = await api.put<Brand>('/Brands/UpdateBrand', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete brand
  deleteBrand: async (id: number): Promise<void> => {
    await api.delete(`/Brands/DeleteBrand?id=${id}`);
  },

  // Get brand addresses
  getBrandAddresses: async (brandId: number): Promise<BrandAddress[]> => {
    const response = await api.get<BrandAddress[]>(`/BrandAddress/GetBrandAddresses?brandId=${brandId}`);
    return response.data;
  },

  // Add brand address
  addBrandAddress: async (address: BrandAddressRequest): Promise<BrandAddress> => {
    // Convertir a PascalCase como espera la API
    const payload: any = {
      BrandId: address.brandId,
      AddressName: address.addressName,
    };
    if (address.country) payload.Country = address.country;
    if (address.estate) payload.Estate = address.estate;
    if (address.city) payload.City = address.city;
    if (address.postalCode) payload.PostalCode = address.postalCode;
    if (address.streetName) payload.StreetName = address.streetName;
    if (address.streetNumber) payload.StreetNumber = address.streetNumber;
    if (address.contactNumber) payload.ContactNumber = address.contactNumber;
    if (address.contactEmail) payload.ContactEmail = address.contactEmail;
    if (address.otherDetails) payload.OtherDetails = address.otherDetails;
    if (address.comment) payload.Comment = address.comment;
    if (address.latitude !== undefined) payload.Latitude = address.latitude;
    if (address.longitude !== undefined) payload.Longitude = address.longitude;

    const response = await api.post<BrandAddress>('/BrandAddress/AddAddress', payload);
    return response.data;
  },

  // Update brand address
  updateBrandAddress: async (addressId: number, address: Partial<BrandAddressRequest>): Promise<BrandAddress> => {
    // Convertir a PascalCase como espera la API
    const payload: any = { AddressId: addressId };
    if (address.addressName) payload.AddressName = address.addressName;
    if (address.country) payload.Country = address.country;
    if (address.estate) payload.Estate = address.estate;
    if (address.city) payload.City = address.city;
    if (address.postalCode) payload.PostalCode = address.postalCode;
    if (address.streetName) payload.StreetName = address.streetName;
    if (address.streetNumber) payload.StreetNumber = address.streetNumber;
    if (address.contactNumber) payload.ContactNumber = address.contactNumber;
    if (address.contactEmail) payload.ContactEmail = address.contactEmail;
    if (address.otherDetails) payload.OtherDetails = address.otherDetails;
    if (address.comment) payload.Comment = address.comment;
    if (address.latitude !== undefined) payload.Latitude = address.latitude;
    if (address.longitude !== undefined) payload.Longitude = address.longitude;

    const response = await api.put<BrandAddress>('/BrandAddress/UpdateAddress', payload);
    return response.data;
  },

  // Delete brand address
  deleteBrandAddress: async (id: number): Promise<void> => {
    await api.delete(`/BrandAddress/DeleteAddress?id=${id}`);
  },
};

export default brandService;
