# Ejemplos: Form Management (RHF + Zod)

## ✅ Patrón Recomendado: Formulario Completo
Este ejemplo combina tipado estricto, validación y manejo de API.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Definición del Schema
const contactSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactForm = () => {
  // 2. Inicialización
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { email: '', message: '' }
  });

  // 3. Handler de envío
  const onSubmit = async (data: ContactFormData) => {
    try {
      await api.post('/contact', data);
      reset();
      toast.success('Enviado correctamente');
    } catch (error) {
      toast.error('Error al enviar');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input {...register('email')} className={errors.email ? 'border-red-500' : ''} />
        {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Cargando...' : 'Enviar'}
      </button>
    </form>
  );
};

const { fields, append, remove } = useFieldArray({
  control,
  name: "phones"
});