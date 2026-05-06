import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { User } from '@repo/auth-core';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @UseGuards(AuthGuard)
  initiatePayment(
    @CurrentUser() user: User,
    @Body() body: { orderId: string },
  ) {
    return this.paymentService.initiatePayment(body.orderId, user.id);
  }

  @Post('webhook')
  handleWebhook(@Body() payload: Record<string, unknown>) {
    return this.paymentService
      .handleWebhook(payload)
      .then(() => ({ status: 'ok' }));
  }

  @Get('verify/:orderId')
  @UseGuards(AuthGuard)
  verifyPayment(@Param('orderId') orderId: string) {
    return this.paymentService.verifyPayment(orderId);
  }
}
