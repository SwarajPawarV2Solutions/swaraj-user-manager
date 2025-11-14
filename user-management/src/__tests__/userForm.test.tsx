import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import UserForm from '../components/UserForm';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const renderWithRoute = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/add" element={<UserForm />} />
        <Route path="/update/:id" element={<UserForm />} />
      </Routes>
    </MemoryRouter>,
  );

describe('UserForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNavigate.mockReset();
  });

  test('adds a user and clears the form', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 'f924' } });

    renderWithRoute('/add');

    await userEvent.type(screen.getByLabelText(/name/i), 'New User');
    await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
    await userEvent.type(screen.getByPlaceholderText(/company name/i), 'New Co');

    await userEvent.click(screen.getByRole('button', { name: /add user/i }));

    await waitFor(() =>
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5000/users', {
        name: 'New User',
        email: 'new@example.com',
        company_name: 'New Co',
      }),
    );

    expect(screen.getByText(/user added successfully!/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/company name/i)).toHaveValue('');
  });

  test('edits a user and navigates back to list', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { id: 'f922', name: 'swaraj', email: 'Swaraj@gmail.com', company_name: 'cv' },
    });
    mockedAxios.put.mockResolvedValueOnce({});

    renderWithRoute('/update/f922');

    const nameInput = await screen.findByDisplayValue('swaraj');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Swaraj Updated');
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'swaraj.updated@example.com');

    await userEvent.click(screen.getByRole('button', { name: /update user/i }));

    await waitFor(() =>
      expect(mockedAxios.put).toHaveBeenCalledWith('http://localhost:5000/users/f922', {
        name: 'Swaraj Updated',
        email: 'swaraj.updated@example.com',
        company_name: 'cv',
      }),
    );

    expect(screen.getByText(/user updated successfully!/i)).toBeInTheDocument();
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith('/'), { timeout: 2000 });
  });
});

