import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

function getBackendErrorMessage(error: HttpErrorResponse): string | null {
  const message = error.error?.message;
  if (typeof message !== 'string') {
    return null;
  }

  const trimmedMessage = message.trim();
  return trimmedMessage || null;
}

function getErrorMessage(error: HttpErrorResponse): string {
  let detail = 'Der Dienst ist aktuell nicht erreichbar. Bitte erneut versuchen.';

  if (error.status >= 500) {
    detail = `Der Dienst konnte die Anfrage nicht verarbeiten (HTTP ${error.status}).`;
  } else if (error.status >= 400) {
    detail = `Die Anfrage ist ungültig oder nicht erlaubt (HTTP ${error.status}).`;
  }

  const backendMessage = getBackendErrorMessage(error);
  return backendMessage ? `${detail} (Nachricht: "${backendMessage}")` : detail;
}

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      messageService.add({
        severity: 'error',
        summary: 'Anfrage fehlgeschlagen',
        detail: getErrorMessage(error),
        life: 5000,
      });

      return throwError(() => error);
    }),
  );
};
