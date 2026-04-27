import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

function getErrorMessage(error: HttpErrorResponse): string {
  if (error.status >= 500) {
    return `Der Dienst konnte die Anfrage nicht verarbeiten (HTTP ${error.status}).`;
  }

  if (error.status >= 400) {
    return `Die Anfrage ist ungültig oder nicht erlaubt (HTTP ${error.status}).`;
  }

  return 'Der Dienst ist aktuell nicht erreichbar. Bitte erneut versuchen.';
}

export const httpErrorToastInterceptor: HttpInterceptorFn = (req, next) => {
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
