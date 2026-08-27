import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCards } from '../components/StatCards';

describe('StatCards Component', () => {
  it('shows loading state when isLoading is true', () => {
    const { container } = render(
      <StatCards 
        isLoading={true} 
        isError={false} 
        total={0} 
        allowed={0} 
        blocked={0} 
        honeypot={0} 
      />
    );
    // Should render pulse skeleton divs
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error state when isError is true', () => {
    render(
      <StatCards 
        isLoading={false} 
        isError={true} 
        total={0} 
        allowed={0} 
        blocked={0} 
        honeypot={0} 
      />
    );
    expect(screen.getByText('Failed to load statistics.')).toBeInTheDocument();
  });

  it('renders stats correctly when data is provided', () => {
    render(
      <StatCards 
        isLoading={false} 
        isError={false} 
        total={100} 
        allowed={80} 
        blocked={15} 
        honeypot={5} 
      />
    );
    
    // Test that the labels exist
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('Allowed')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByText('Honeypot')).toBeInTheDocument();
    
    // Test that the values are rendered
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
