import { Controller } from '@nestjs/common';
import { GroceryService } from './grocery.service';

@Controller('grocery')
export class GroceryController {
  constructor(private groceryService: GroceryService) {}

  // @Get('list')
  // async getThreads() {
  //   return await this.groceryService.getUserThreads(+id);
  // }
}

// As i user i open the app
// then app should display login screen
// user should be able to sign in with google, or apple
// i choose sign in with google, accept.
// then i should see dashboard
