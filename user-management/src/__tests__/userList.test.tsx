import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import UserList from '../components/UserList';

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

const renderUserList = () =>
  render(
    <MemoryRouter>
      <UserList />
    </MemoryRouter>,
  );

describe('UserList Component', () => {
  const mockUsers = [
    { id: 'f922', name: 'swaraj', email: 'Swaraj@gmail.com', company_name: 'cv' },
    { id: 'f923', name: 'sourabh', email: 'alex@gmail.com', company_name: 'xyz' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedNavigate.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders list of users from api', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockUsers });

    renderUserList();

    expect(await screen.findByText('swaraj')).toBeInTheDocument();
    expect(await screen.findByText('sourabh')).toBeInTheDocument();
  });

  test('deletes user from the list when delete is confirmed', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockUsers });
    mockedAxios.delete.mockResolvedValueOnce({});
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    renderUserList();

    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this user?');
    await waitFor(() =>
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:5000/users/f922'),
    );
    await waitFor(() => expect(screen.queryByText('swaraj')).not.toBeInTheDocument());
  });
});