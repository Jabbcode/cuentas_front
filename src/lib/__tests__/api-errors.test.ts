import axios from 'axios';
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from '../api-errors';

describe('getApiErrorMessage', () => {
  it('retorna mensaje de conexión cuando no hay respuesta del servidor', () => {
    const networkError = new axios.AxiosError('Network Error');
    networkError.response = undefined;

    expect(getApiErrorMessage(networkError, 'Email o contraseña incorrectos')).toBe(
      'Error de conexión. Verifica tu internet e intenta de nuevo.'
    );
  });

  it('retorna el fallback cuando el servidor responde con error sin campo error', () => {
    const axiosError = new axios.AxiosError('Request failed with status code 401');
    axiosError.response = {
      data: {},
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: axiosError.config ?? ({} as typeof axiosError.config),
    };

    expect(getApiErrorMessage(axiosError, 'Email o contraseña incorrectos')).toBe(
      'Email o contraseña incorrectos'
    );
  });

  it('retorna el campo error del servidor cuando está presente', () => {
    const axiosError = new axios.AxiosError('Request failed with status code 400');
    axiosError.response = {
      data: { error: 'El email ya está en uso' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: axiosError.config ?? ({} as typeof axiosError.config),
    };

    expect(getApiErrorMessage(axiosError, 'Error al registrar')).toBe('El email ya está en uso');
  });

  it('retorna el fallback por defecto para errores no-Axios', () => {
    expect(getApiErrorMessage(new Error('algo falló'))).toBe('algo falló');
    expect(getApiErrorMessage('string error')).toBe('Ha ocurrido un error inesperado');
  });
});
