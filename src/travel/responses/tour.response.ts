import { UtilCommonTemplate } from "../../utils/utils.common";

export class TourResponse {
  id: string
  tourName: string;
  description: string;
  startPlace: string;
  startTime: Date | string;
  quantity: number;
  price: number;
  discount: number;
  rating: number;
  following: number;
  image: string;
  address: string;
  isHotel: number;
  isCar: number;
  isAirplane: number;

  constructor(data?: any) {
    this.id = data?.travel_id || '';
    this.tourName = data?.tour_name || '';
    this.description = data?.description || '';
    this.startPlace = data?.start_place || '';
    this.startTime = UtilCommonTemplate.toDateTime(data?.start_time) || '';
    this.image = data?.image || '';
    this.address = data?.address || '';
    this.quantity = data?.quantity || 0;
    this.price = data?.price || 0;
    this.discount = data?.discount || 0;
    this.rating = data?.rating || 0;
    this.following = data?.following || 0;
    this.isHotel = data?.is_hotel || 0;
    this.isCar = data?.is_car || 0;
    this.isAirplane = data?.is_airplane || 0;
  }

  public mapToList(data?: any[]) {
    return data.map(item => new TourResponse(item))
  }
}