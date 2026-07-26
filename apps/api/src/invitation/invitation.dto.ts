import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateInvitationRequestDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsDateString()
  surveyDate!: string;

  @IsString()
  @IsNotEmpty()
  projectType!: string;

  @IsString()
  @IsNotEmpty()
  estimatedBudget!: string;

  @IsString()
  @IsNotEmpty()
  projectAddress!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class VerifyInvitationWhatsappDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;
}