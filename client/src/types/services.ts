/*
|--------------------------------------------------------------------------
| Cloud Services Domain Types
|--------------------------------------------------------------------------
|
| Service breakdown analytics.
|
*/

export interface CloudService {
  name: string;
  spend: number;
  percentage: number;
}

export interface ServicesResponse {
  services: CloudService[];
}
