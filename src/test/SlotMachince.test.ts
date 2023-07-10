import { mount } from "@vue/test-utils";
import SlotMachine from "../components/SlotMachine.vue";

// Mocking Swal
// jest.mock('sweetalert2', () => ({
//   fire: jest.fn(),
// }));

const defaultTimeForFinishRoll = 4000;
describe("SlotMachine", () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(SlotMachine);
  });

  afterEach(() => {
    wrapper.unmount();
    // jest.clearAllMocks();
  });

  test("initial credits should be 10", () => {
    expect(wrapper.vm.credits).toBe(10);
  });

  test("roll() should deduct 1 credit and start spinning", async () => {
    wrapper.vm.roll();
    expect(wrapper.vm.credits).toBe(9);
    expect(wrapper.vm.spinning).toBe(true);
  });

  test("roll() should show results after spinning", async () => {
    wrapper.vm.roll();
    await wrapper.vm.$nextTick();
    setTimeout(() => {
      expect(wrapper.vm.results.length).toBe(3);
      expect(wrapper.vm.spinning).toBe(false);
    }, 1000);
    setTimeout(() => {
      expect(wrapper.findAll(".spinner")).toHaveLength(0);
      expect(wrapper.findAll(".slot")).toHaveLength(3);
    }, defaultTimeForFinishRoll);
  });

  test("cashOut() should cash out credits and reset the game", async () => {
    wrapper.vm.roll();
    await wrapper.vm.$nextTick();
    setTimeout(() => {
      wrapper.vm.cashOut();
      expect(wrapper.vm.credits).toBe(0);
      expect(wrapper.vm.results.length).toBe(0);
      expect(wrapper.vm.spinning).toBe(false);
    },defaultTimeForFinishRoll);

  });

  test("should display the correct symbol icons", async () => {
    const results = [{ icon: "🍒" }, { icon: "🍋" }, { icon: "🍊" }];
    wrapper.vm.results = results;
    await wrapper.vm.$nextTick();
    console.log(wrapper.vm.results);
    expect(wrapper.vm.results).toEqual(results);
  });
});
