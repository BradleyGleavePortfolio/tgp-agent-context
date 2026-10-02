import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
const mockNavigation = { navigate: jest.fn(), setOptions: jest.fn(), goBack: jest.fn(), replace: jest.fn() };
const mockProgram = jest.fn();
const mockCreate = jest.fn();
const mockAssign = jest.fn();
const mockUpdate = jest.fn();
const mockInvalidate = jest.fn();
jest.mock("@react-navigation/native", () => ({ useNavigation: () => mockNavigation }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("../../../../theme/ThemeProvider", () => ({
  useTheme: () => ({ colors: new Proxy({}, { get: () => "#123456" }) }),
}));
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ setQueryData: jest.fn(), invalidateQueries: jest.fn() }),
}));
jest.mock("../../../../services/sentry", () => ({ captureError: jest.fn() }));
jest.mock("../../../../services/api", () => ({ __esModule: true, default: {}, coachApi: {} }));
jest.mock("../../../../hooks/usePrograms", () => ({
  programKeys: { detail: (id: string) => ["d", id] },
  useProgram: (...a: unknown[]) => mockProgram(...a),
  useAssignableClients: () => ({ data: [{ id: "c1", name: "Client 1", email: "a@example.test" }], isLoading: false }),
  useInvalidatePrograms: () => mockInvalidate,
}));
jest.mock("../../../../api/programsApi", () => ({
  ...jest.requireActual("../../../../api/programsApi"),
  programsApi: { create: (...a: unknown[]) => mockCreate(...a), assign: (...a: unknown[]) => mockAssign(...a), update: (...a: unknown[]) => mockUpdate(...a) },
}));
import ProgramFormScreen from "../ProgramFormScreen";
import ProgramAssignScreen from "../ProgramAssignScreen";
import { describeProgramFailure } from "../../../../utils/programErrors";
function fake<T>(v: object): T { return v as T; }
const detail = { id: "p1", version: 3, name: "Original name", description: "", goal_tag: "", weeks: 4, days_per_week: 3, filled_days: 1 };
beforeEach(() => {
  jest.clearAllMocks();
  mockProgram.mockReturnValue({ data: detail, isLoading: false, refetch: jest.fn() });
  mockCreate.mockResolvedValue({ id: "new" });
  mockAssign.mockResolvedValue({ results: [{ client_id: "c1", status: "assigned" }] });
});
it("new assignment date gets a new logical intent key", async () => {
  const screen = await render(<ProgramAssignScreen {...fake<Parameters<typeof ProgramAssignScreen>[0]>({ route: { params: { programId: "p1" } }, navigation: mockNavigation })} />);
  await fireEvent.press(screen.getByLabelText("Select all shown (1)"));
  await fireEvent.press(screen.getByLabelText("Assign to 1 client"));
  await fireEvent.changeText(screen.getByLabelText("Start date, year month day"), "2026-11-09");
  await fireEvent.press(screen.getByLabelText("Assign to 1 client"));
  expect(mockAssign).toHaveBeenCalledTimes(2);
  expect(mockAssign.mock.calls[1][2]).not.toBe(mockAssign.mock.calls[0][2]);
});
it("unknown create outcome retries the original key", async () => {
  mockCreate.mockRejectedValueOnce(new Error("connection lost after commit"));
  const screen = await render(<ProgramFormScreen {...fake<Parameters<typeof ProgramFormScreen>[0]>({ route: { params: {} }, navigation: mockNavigation })} />);
  await fireEvent.changeText(screen.getByLabelText("Program name"), "Fresh program");
  await fireEvent.press(screen.getByLabelText("Create program"));
  await fireEvent.press(screen.getByLabelText("Create program"));
  expect(mockCreate).toHaveBeenCalledTimes(2);
  expect(mockCreate.mock.calls[1][1]).toBe(mockCreate.mock.calls[0][1]);
});
it("known HTTP unauthorized asks for sign in, not a server retry", () => {
  const failure = describeProgramFailure({ response: { status: 401, data: { code: "unauthorized" } } }, "save");
  expect(failure.message).toMatch(/sign in|log in|session/i);
});
it("refetched version cannot silently pair stale untouched fields with the fresh version", async () => {
  mockUpdate.mockRejectedValueOnce({ response: { status: 409, data: { code: "program_version_conflict" } } });
  const props = fake<Parameters<typeof ProgramFormScreen>[0]>({ route: { params: { programId: "p1" } }, navigation: mockNavigation });
  const screen = await render(<ProgramFormScreen {...props} />);
  await fireEvent.press(screen.getByLabelText("Save details"));
  mockProgram.mockReturnValue({ data: { ...detail, version: 4, name: "Other device name" }, isLoading: false, refetch: jest.fn() });
  await screen.rerender(<ProgramFormScreen {...props} />);
  expect(screen.getByLabelText("Program name").props.value).toBe("Other device name");
});
