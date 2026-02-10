const voucherNumberInput = document.querySelector("#voucher-number");
const applyDateInput = document.querySelector("#apply-date");
const buyerNameInput = document.querySelector("#buyer-name");
const buyerTaxIdInput = document.querySelector("#buyer-tax-id");
const itemNameInputs = Array.from(document.querySelectorAll(".item-name"));
const itemAmountInputs = Array.from(document.querySelectorAll(".item-amount"));
const totalUpperInput = document.querySelector("#total-upper");
const totalLowerInput = document.querySelector("#total-lower");
const issuerInput = document.querySelector("#issuer");
const errorList = document.querySelector("#error-list");
const validateBtn = document.querySelector("#validate-btn");

const taxIdPattern = /^[0-9A-Z]{18}$/;
const voucherNumberPattern = /^[A-Za-z0-9]+$/;

const formatNumber = (value) => (Number.isNaN(value) ? "" : value.toFixed(2));

const collectAmountSum = () =>
  itemAmountInputs.reduce((sum, input) => {
    const parsed = Number.parseFloat(input.value);
    if (Number.isNaN(parsed)) {
      return sum;
    }
    return sum + parsed;
  }, 0);

const updateTotalLower = () => {
  const sum = collectAmountSum();
  const hasAnyValue = itemAmountInputs.some((input) => input.value !== "");
  totalLowerInput.value = hasAnyValue ? formatNumber(sum) : "";
};

itemAmountInputs.forEach((input) => {
  input.addEventListener("input", updateTotalLower);
});

buyerTaxIdInput.addEventListener("input", (event) => {
  event.target.value = event.target.value.toUpperCase();
});

const validateItems = () => {
  const filledRows = itemNameInputs
    .map((nameInput, index) => ({
      name: nameInput.value.trim(),
      amount: itemAmountInputs[index].value.trim(),
      amountValue: Number.parseFloat(itemAmountInputs[index].value),
    }))
    .filter((row) => row.name || row.amount);

  if (filledRows.length === 0) {
    return ["至少填写一行项目名称与金额。"];
  }

  const errors = [];
  filledRows.forEach((row, index) => {
    if (!row.name) {
      errors.push(`第 ${index + 1} 行缺少项目名称。`);
    }
    if (row.amount === "") {
      errors.push(`第 ${index + 1} 行缺少金额。`);
    } else if (Number.isNaN(row.amountValue) || row.amountValue < 0) {
      errors.push(`第 ${index + 1} 行金额需为非负数值。`);
    } else if (!/^\d+(\.\d{1,2})?$/.test(row.amount)) {
      errors.push(`第 ${index + 1} 行金额最多两位小数。`);
    }
  });

  return errors;
};

const validateTotals = () => {
  const errors = [];
  const sum = collectAmountSum();
  const totalLower = Number.parseFloat(totalLowerInput.value);
  if (!Number.isNaN(totalLower) && Number.isNaN(sum)) {
    errors.push("请先填写项目金额。");
  }
  if (!Number.isNaN(totalLower) && Math.abs(totalLower - sum) > 0.01) {
    errors.push("合计金额（小写）需等于项目金额合计。");
  }
  return errors;
};

const validateForm = () => {
  const errors = [];

  if (!voucherNumberInput.value.trim()) {
    errors.push("凭证号码为必填项。");
  } else if (!voucherNumberPattern.test(voucherNumberInput.value.trim())) {
    errors.push("凭证号码仅支持字母与数字组合。");
  }

  if (!applyDateInput.value) {
    errors.push("申请日期为必填项。");
  }

  if (!buyerNameInput.value.trim()) {
    errors.push("购买方名称为必填项。");
  }

  const buyerTaxId = buyerTaxIdInput.value.trim();
  if (!buyerTaxId) {
    errors.push("购买方统一社会信用代码/纳税人识别号为必填项。");
  } else if (!taxIdPattern.test(buyerTaxId)) {
    errors.push("购买方统一社会信用代码需为18位大写字母或数字。");
  }

  errors.push(...validateItems());
  errors.push(...validateTotals());

  if (!issuerInput.value.trim()) {
    errors.push("开具人为必填项。");
  }

  return errors;
};

validateBtn.addEventListener("click", () => {
  const errors = validateForm();
  if (errors.length === 0) {
    errorList.textContent = "校验通过，可继续打印或保存凭证。";
    errorList.classList.remove("error-list--fail");
  } else {
    errorList.innerHTML = `<ul>${errors
      .map((error) => `<li>${error}</li>`)
      .join("")}</ul>`;
    errorList.classList.add("error-list--fail");
  }
});
