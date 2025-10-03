import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from './pipes/zod-validation-pipe';
import * as signinDto from './dto/signin.dto';
import * as signupDto from './dto/signup.dto';
import { HeadersDto } from './dto/headers.dto';
import { RequestHeader } from './pipes/request-header';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @UsePipes(new ZodValidationPipe(signinDto.signinAuthDtoSchema))
  signin(
    // @ApiResponse({
    //   status: 201,
    //   description: 'User registered successfully',
    //   type: ResponseDto,
    // })
    @Body()
    body: signinDto.SigninAuthDto,
  ) {
    console.log(process.env.DATA_BASE_URI, 'DATA_BASE_URIDATA_BASE_URI');
    return this.authService.signin(body);
  }

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signupDto.signupAuthDtoSchema))
  async signup(
    @Body()
    body: signupDto.SignupAuthDto,
  ) {
    return await this.authService.signup(body);
  }

  @Get('me')
  async getMe(
    @RequestHeader(HeadersDto)
    header: HeadersDto,
  ) {
    return await this.authService.getUserMe(header.accessToken);
  }
}
