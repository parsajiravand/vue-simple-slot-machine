<template>
  <div class="slot-machine">
    <aside class="rules">
      <!-- Slot machine documention -->
      <h1>Slot Machine</h1>
      <p>
        Welcome to the slot machine! You have <strong>10 credits</strong> to
        start with. Each roll costs <strong>1 credit</strong>. If you get 3 of
        the same symbols, you win credits based on the symbol. You can cash out
        at any time to collect your credits.
      </p>
      <p><strong>Cherry</strong> - 10 credits</p>
      <p><strong>Lemon</strong> - 20 credits</p>
      <p><strong>Orange</strong> - 30 credits</p>
      <p><strong>Watermelon</strong> - 40 credits</p>
      <p>
        <strong>Re-rolling</strong> - You have a chance to re-roll each block
        after the initial roll. The chance of re-rolling is based on your credit
        balance.
      </p>
      <p>
        <strong>Cash out</strong> - You can cash out at any time to collect your
        credits. The cash out button will randomly move and disable itself.
      </p>
    </aside>
    <main>
      <div class="credits">Credits: {{ credits }}</div>
      <section class="slot-container">
        <div class="slot" v-for="(symbol, index) in results" :key="index">
          <div v-if="spinning && symbol === null" class="spinner">
            <span> X </span>
          </div>
          <div v-else-if="symbol !== null">{{ symbol.icon }}</div>
        </div>
        <!-- show first time before start or cache out -->
        <div v-if="results.length === 0" class="before-start">
          <div class="slot" v-for="index in 3" :key="index">
            <div>?</div>
          </div>
        </div>
      </section>
      <section>
        <button
          class="roll"
          @click="roll"
          :disabled="spinning"
          @keyup.enter="roll"
        >
          {{ results.length === 0 ? "ROLL" : "RE-ROLL" }}
        </button>
        <button
          @click="cashOut"
          :disabled="cashOutButton.disabled"
          @mouseover="handleCashOutHover"
        >
          CASH OUT
        </button>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "@vue/reactivity";
import Swal from "sweetalert2";

interface Symbol {
  name: string;
  value: string;
  icon: string;
}
interface CashOutButton {
  text: string;
  disabled: boolean;
  moved: boolean;
}

const symbols: Symbol[] = [
  {
    name: "Cherry",
    value: "C",
    icon: "🍒",
  },
  {
    name: "Lemon",
    value: "L",
    icon: "🍋",
  },
  {
    name: "Orange",
    value: "O",
    icon: "🍊",
  },
  {
    name: "Watermelon",
    value: "W",
    icon: "🍉",
  },
]; // Cherry, Lemon, Orange, Watermelon
const credits = ref<number>(10); // Initial credits
const spinning = ref<boolean>(false); // Flag to indicate if the slots are spinning
const results = ref<Symbol[]>([]); // Array to store the slot machine results
const cashOutButton = ref<CashOutButton>({
  // Cash out button properties
  text: "CASH OUT",
  disabled: false,
  moved: false,
});

function roll() {
  if (spinning.value) {
    return;
  }
  if (credits.value <= 0) {
    Swal.fire({
      title: "Oops!",
      text: "You don't have enough credits to play. Please cash out.",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  // Disable cash out button while spinning
  cashOutButton.value.disabled = true;

  // Deduct 1 credit for rolling
  credits.value--;

  // Set spinning flag to true
  spinning.value = true;

  // Generate initial null results for each block
  //@ts-ignore
  results.value = Array.from({ length: 3 }, () => null);

  // Determine the chance of re-rolling based on credit balance
  let reRollChance = credits.value < 40 ? 0 : credits.value < 60 ? 0.3 : 0.6;

  // Delay displaying the results one by one
  let delay = 1000;
  for (let i = 0; i < results.value.length; i++) {
    setTimeout(() => {
      let symbol = getRandomSymbol();

      // Perform re-roll if necessary
      if (shouldReRoll(reRollChance)) {
        symbol = getRandomSymbol();
      }

      results.value.splice(i, 1, symbol);
    }, delay + (i + 1) * 1000);
  }

  // Delay the final check for winning
  setTimeout(() => {
    checkWin();
    spinning.value = false;
    cashOutButton.value.disabled = false;
  }, delay + 3500);
}

function checkWin() {
  if (results.value.every((symbol: Symbol) => symbol === results.value[0])) {
    // All symbols are the same, player wins
    let reward = getReward(results.value[0] as Symbol);
    credits.value += reward;
    Swal.fire({
      title: "You won!",
      text: `Congratulations! You won ${reward} credits.`,
      icon: "success",
      confirmButtonText: "OK",
    });
  } else {
    Swal.fire({
      title: "You lost!",
      text: "Better luck next time!",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

function cashOut() {
  if (cashOutButton.value.disabled) {
    return;
  }

  // Randomly move the cash out button
  if (Math.random() < 0.5) {
    moveCashOutButton();
  }

  // Randomly disable the cash out button
  if (Math.random() < 0.4) {
    cashOutButton.value.disabled = true;
  }

  // Cash out the credits and reset the game
  let cashOutAmount = credits.value;
  credits.value = 0;
  results.value = [];
  spinning.value = false;
  Swal.fire({
    title: "Cashed out!",
    text: `You cashed out ${cashOutAmount} credits. Thanks for playing!`,
    icon: "success",
    confirmButtonText: "OK",
  });
}

function moveCashOutButton() {
  cashOutButton.value.moved = true;
  setTimeout(() => {
    cashOutButton.value.moved = false;
  }, 1000);
}

function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function getReward({ value }: { value: string }) {
  switch (value) {
    case "C":
      return 10;
    case "L":
      return 20;
    case "O":
      return 30;
    case "W":
      return 40;
    default:
      return 0;
  }
}

function shouldReRoll(reRollChance: number) {
  return Math.random() < reRollChance;
}

function handleCashOutHover() {
  if (Math.random() < 0.5) {
    moveCashOutButton();
  }

  if (Math.random() < 0.4) {
    cashOutButton.value.disabled = true;
  }
}
</script>

<style scoped>
.before-start {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.slot-machine {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 2rem;
}
@media screen and (max-width: 768px) {
  .slot-machine {
    flex-direction: column;
  }
  .slot-machine aside {
    flex-basis: 100%;
    margin: 0;
  }
  .slot-machine main {
    flex-basis: 100%;
  }
}
.slot-machine aside {
  margin: 0 2rem;
  text-align: left;
  flex-basis: 50%;
}
.slot-machine main {
  flex-basis: 50%;
}
.credits {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem;
}
.slot-container {
  display: flex;
  justify-content: center;
}

.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #000;
  padding: 1rem;
  margin: 0.5rem;
  min-width: 80px;
  font-size: 2rem;
}
.spinner {
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
.roll {
  margin: 10px 20px;
}
</style>
