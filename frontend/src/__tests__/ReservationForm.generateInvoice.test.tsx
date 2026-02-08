import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReservationForm from "../components/ReservationForm";
import * as reservationsApi from "../api/reservations";
import * as invoicesApi from "../api/invoices";

// mock feature flag to ensure button is shown
vi.mock("../utils/featureFlags", () => ({ isFeatureEnabled: () => true }));

vi.mock("../api/reservations", () => ({
  createReservation: vi.fn(),
  updateReservation: vi.fn(),
  calculateReservationPriceDetailed: vi.fn(),
}));

vi.mock("../api/invoices", () => ({
  createInvoice: vi.fn(),
}));

describe("ReservationForm generateInvoice", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // restore location
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
  });

  it("calls calculate and createInvoice, then navigates to invoice", async () => {
    const reservation = {
      id: "res-1",
      room_id: "room-1",
      start_date: "2026-03-01",
      end_date: "2026-03-02",
      adults_count: 2,
    } as any;

    // make calculate return a total
    (reservationsApi.calculateReservationPriceDetailed as unknown as vi.Mock).mockResolvedValue({ total: 123.45 });
    (invoicesApi.createInvoice as unknown as vi.Mock).mockResolvedValue({ id: 'inv-1' });

    // stub location to observe navigation (ReservationForm sets window.location.href)
    delete (window as any).location;
    (window as any).location = { href: '' } as any;

    render(<ReservationForm reservation={reservation} />);

    // button should be visible because feature flag mocked true
    const btn = await screen.findByText(/Gerar fatura/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(reservationsApi.calculateReservationPriceDetailed).toHaveBeenCalledWith(expect.objectContaining({ room_id: 'room-1' }));
      expect(invoicesApi.createInvoice).toHaveBeenCalledWith(expect.objectContaining({ reservation_id: 'res-1' }));
      expect((window as any).location.href).toContain('/invoices/inv-1');
    });
  });
});
