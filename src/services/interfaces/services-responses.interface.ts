import { Service } from '../entities';

export type CreateServiceResponse = Service;
export type GetServiceResponse = Service;
export type GetServicesResponse = {
  count: number;
  pages: number;
  services: Service[];
};
export type UpdateServiceResponse = Service;
export type DeleteServiceResponse = Service;
