'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '../index';
import { Shield, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface SubmitStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export function SubmitStep({ register, errors }: SubmitStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          You&apos;re almost there!
        </h2>
        <p className="text-muted-foreground">
          Just one more thing before we start your transformation.
        </p>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
        <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
          <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm text-foreground">No Commitment</div>
            <div className="text-xs text-muted-foreground">Cancel anytime</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
          <Shield className="h-6 w-6 text-primary flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm text-foreground">Secure Payment</div>
            <div className="text-xs text-muted-foreground">Your data is safe</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
          <Clock className="h-6 w-6 text-primary flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm text-foreground">Instant Access</div>
            <div className="text-xs text-muted-foreground">Start right away</div>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">$29/month</h3>
            <p className="text-sm text-muted-foreground">Cancel anytime, no questions asked</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-foreground">Daily personalized workouts via text</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-foreground">24/7 access to your coach</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-foreground">Adaptive programming that evolves with you</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-foreground">Progress tracking and accountability</span>
          </div>
        </div>
      </div>

      {/* Risk Acceptance */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            {...register('acceptRisks')}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            id="acceptRisks"
          />
          <div className="flex-1">
            <label htmlFor="acceptRisks" className="text-sm text-foreground cursor-pointer">
              I understand and accept the risks associated with exercise. I acknowledge that
              GymText provides general fitness guidance and is not a substitute for medical
              advice. I should consult with a healthcare provider before starting any new
              exercise program.
            </label>
            {errors.acceptRisks && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {errors.acceptRisks.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          By submitting this form, you agree to receive text messages from GYMTEXT at the
          phone number provided. Message and data rates may apply.
        </p>
      </div>
    </div>
  );
}
