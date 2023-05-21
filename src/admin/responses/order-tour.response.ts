import { TourResponse } from '../../travel/responses/tour.response';
import { UserResponse } from '../../user/responses/user.response';

export class OrderTourResponse {
  id: string;
  totalPayment: number;
  status: number;
  tour: TourResponse;
  user: UserResponse;

  constructor(data?) {
    this.id = data?.order_tour_id || '';
    this.totalPayment = data?.total_payment || 0;
    this.status = data?.status || 0;
    this.tour = new TourResponse(data?.tour || '');
    this.user = new UserResponse(data?.user || '');
  }

  public mapToList(data?) {
    return data.map((item) => new OrderTourResponse(item));
  }
}
