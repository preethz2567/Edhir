/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { StatCards } from '../components/StatCards';

describe('StatCards Component', () => {
  it('shows loading skeleton when isLoading is true', () => {
    const { container } = render(
      <StatCards isLoading={true} isError={false} total={0} allowed={0} blocked={0} honeypot={0} />
    );
    // Skeleton divs should be present (no real values)
    expect(container.querySelectorAll('.stat-card').length).toBe(4);
    expect(screen.queryByText('0')).toBeNull();
  });

  it('shows error alert when isError is true', () => {
    render(
      <StatCards isLoading={false} isError={true} total={0} allowed={0} blocked={0} honeypot={0} />
    );
    expect(screen.getByText(/Failed to load statistics/i)).toBeInTheDocument();
  });

  it('renders stat values correctly when data is provided', () => {
    render(
      <StatCards isLoading={false} isError={false} total={100} allowed={80} blocked={15} honeypot={5} />
    );
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('Allowed')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByText('Honeypot')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
