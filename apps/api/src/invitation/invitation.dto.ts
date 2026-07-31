import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateInvitationLinkDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class CreateInvitationRequestDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsDateString()
  surveyDate!: string;

  @IsString()
  @IsNotEmpty()
  projectType!: string;

  @IsString()
  @IsOptional()
  estimatedBudget?: string;

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

  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class VerifyInvitationWhatsappDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;
}