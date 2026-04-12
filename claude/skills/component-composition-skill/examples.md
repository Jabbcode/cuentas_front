# Ejemplos: Component Composition

## ❌ Mal Patrón: El Componente "Configurable" (Rígido)
Este patrón requiere añadir una nueva prop por cada cambio visual solicitado.

```tsx
// MAL: El componente es una caja negra difícil de personalizar
<Banner 
  title="Oferta" 
  showButton={true} 
  buttonText="Click aquí" 
  onBtnClick={handleBtn}
  variant="warning"
/>

// BIEN: Estructura semántica y reutilizable
import { Banner } from './Banner';

export const DiscountBanner = () => (
  <Banner variant="warning">
    <Banner.Header>
      <Title>Oferta Especial</Title>
    </Banner.Header>
    <Banner.Body>
      <p>Contenido flexible inyectado mediante composición.</p>
      <Button onClick={handleBtn}>Click aquí</Button>
    </Banner.Body>
  </Banner>
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat';
  children: React.ReactNode;
}

export const Card = ({ variant = 'flat', children, className, ...props }: CardProps) => (
  <div 
    className={`card card--${variant} ${className ?? ''}`} 
    {...props}
  >
    {children}
  </div>
);