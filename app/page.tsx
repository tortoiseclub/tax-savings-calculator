"use client";

import { useState, useMemo } from "react";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";

export default function CalculatorPage() {
  const [grossSalary, setGrossSalary] = useState<string>("");
  const [deviceValue, setDeviceValue] = useState<string>("");
  const [bestPrice, setBestPrice] = useState<string>("");
  const [tortoiseListPrice, setTortoiseListPrice] = useState<string>("");

  // Helper function to calculate basic tax without surcharge (moved outside main function)
  const calculateBasicTax = (income: number) => {
    let tax = 0;
    const standardDeduction = 75000;
    const taxableIncome = Math.max(0, income - standardDeduction);

    // Calculate tax using new regime slabs
    if (taxableIncome <= 400000) {
      tax = 0;
    } else if (taxableIncome <= 800000) {
      tax = (taxableIncome - 400000) * 0.05;
    } else if (taxableIncome <= 1200000) {
      tax = 400000 * 0.05 + (taxableIncome - 800000) * 0.1;
    } else if (taxableIncome <= 1600000) {
      tax = 400000 * 0.05 + 400000 * 0.1 + (taxableIncome - 1200000) * 0.15;
    } else if (taxableIncome <= 2000000) {
      tax =
        400000 * 0.05 +
        400000 * 0.1 +
        400000 * 0.15 +
        (taxableIncome - 1600000) * 0.2;
    } else if (taxableIncome <= 2400000) {
      tax =
        400000 * 0.05 +
        400000 * 0.1 +
        400000 * 0.15 +
        400000 * 0.2 +
        (taxableIncome - 2000000) * 0.25;
    } else {
      tax =
        400000 * 0.05 +
        400000 * 0.1 +
        400000 * 0.15 +
        400000 * 0.2 +
        400000 * 0.25 +
        (taxableIncome - 2400000) * 0.3;
    }

    // Section 87A Rebate
    if (income <= 1275000) {
      tax = 0;
    }

    return tax;
  };

  // Tax calculation logic - New Tax Regime FY 2025-26 (AY 2026-27)
  const calculateTax = (annualSalary: number) => {
    // Calculate basic tax using helper function
    const tax = calculateBasicTax(annualSalary);

    // Calculate surcharge based on total income (before standard deduction)
    let surcharge = 0;
    let surchargeRate = 0;

    if (annualSalary > 20075000) {
      // More than Rs 2 Crore ≤ Rs 5 Crore - 25%
      surchargeRate = 0.25;
      surcharge = tax * surchargeRate;
    } else if (annualSalary > 10075000) {
      // More than Rs 1 Crore ≤ Rs 2 Crore - 15%
      surchargeRate = 0.15;
      surcharge = tax * surchargeRate;
    } else if (annualSalary > 5075000) {
      // More than Rs 50 lakhs ≤ Rs 1 Crore - 10%
      surchargeRate = 0.1;
      surcharge = tax * surchargeRate;
    }

    // Calculate total tax before marginal relief (including cess)
    let totalTaxBeforeCess = tax + surcharge;
    let cess = totalTaxBeforeCess * 0.04;
    let totalTaxWithCess = totalTaxBeforeCess + cess;

    // Apply marginal relief for surcharge thresholds (including cess in calculations)
    if (annualSalary > 5075000 && annualSalary <= 10075000) {
      // Marginal relief for Rs 50 lakhs to Rs 1 crore bracket
      const basicTaxAt50Lakhs = calculateBasicTax(5075000);

      const excessIncome = annualSalary - 5075000;
      const excessTax = totalTaxBeforeCess - basicTaxAt50Lakhs;

      if (excessTax > excessIncome) {
        const marginalRelief = excessTax - excessIncome;
        totalTaxBeforeCess = totalTaxBeforeCess - marginalRelief;
        cess = totalTaxBeforeCess * 0.04;
        totalTaxWithCess = totalTaxBeforeCess + cess;
      }
    } else if (annualSalary > 10075000 && annualSalary <= 20075000) {
      // Marginal relief for Rs 1 crore to Rs 2 crore bracket
      const basicTaxAt1Crore = calculateBasicTax(10075000);
      const surchargeAt1Crore = basicTaxAt1Crore * 0.1; // 10% surcharge
      const taxBeforeCessAt1Crore = basicTaxAt1Crore + surchargeAt1Crore;

      const excessIncome = annualSalary - 10075000;
      const excessTax = totalTaxBeforeCess - taxBeforeCessAt1Crore;

      if (excessTax > excessIncome) {
        const marginalRelief = excessTax - excessIncome;
        totalTaxBeforeCess = totalTaxBeforeCess - marginalRelief;
        cess = totalTaxBeforeCess * 0.04;
        totalTaxWithCess = totalTaxBeforeCess + cess;
      }
    } else if (annualSalary > 20075000) {
      // Marginal relief for Rs 2 crore to Rs 5 crore bracket
      const basicTaxAt2Crore = calculateBasicTax(20075000);
      const surchargeAt2Crore = basicTaxAt2Crore * 0.15; // 15% surcharge
      const taxBeforeCessAt2Crore = basicTaxAt2Crore + surchargeAt2Crore;

      const excessIncome = annualSalary - 20075000;
      const excessTax = totalTaxBeforeCess - taxBeforeCessAt2Crore;

      if (excessTax > excessIncome) {
        const marginalRelief = excessTax - excessIncome;
        totalTaxBeforeCess = totalTaxBeforeCess - marginalRelief;
        cess = totalTaxBeforeCess * 0.04;
        totalTaxWithCess = totalTaxBeforeCess + cess;
      }
    }

    // Final check: Ensure net income after tax does not go below ₹12,75,000
    // This should only apply to very low incomes and shouldn't conflict with surcharge calculations
    const netIncomeAfterTax = annualSalary - totalTaxBeforeCess;
    if (netIncomeAfterTax < 1275000 && annualSalary > 1275000) {
      const adjustedTax = Math.max(0, annualSalary - 1275000);
      const adjustedCess = adjustedTax * 0.04;
      return adjustedTax + adjustedCess;
    }

    return totalTaxWithCess;
  };

  // Calculations for buying without Tortoise
  const withoutTortoiseCalcs = useMemo(() => {
    const salary = (parseFloat(grossSalary) || 0) / 12;
    const device = parseFloat(bestPrice) || 0;

    const annualSalary = salary * 12;
    const annualTax = calculateTax(annualSalary);
    const monthlyTax = annualTax / 12;
    const netMonthlySalary = salary - monthlyTax;
    const monthlyDeviceDeduction = device / 12; // Assuming 1-year EMI
    const remainingAmount = netMonthlySalary - monthlyDeviceDeduction;
    const remainingAmountAnnual = remainingAmount * 12;

    return {
      grossMonthlySalary: salary,
      tax: monthlyTax,
      netMonthlySalary,
      monthlyDeviceDeduction,
      remainingAmount,
      remainingAmountAnnual,
    };
  }, [grossSalary, deviceValue, bestPrice, tortoiseListPrice]);

  // Calculations for buying with Tortoise
  const withTortoiseCalcs = useMemo(() => {
    const salary = (parseFloat(grossSalary) || 0) / 12;
    const device = parseFloat(tortoiseListPrice) || 0;

    // With Tortoise, device cost is deducted from gross salary (pre-tax)
    const adjustedGrossSalary = salary - device / 12;
    const annualAdjustedSalary = adjustedGrossSalary * 12;
    const annualTax = calculateTax(annualAdjustedSalary);
    const monthlyTax = annualTax / 12;
    const actualDeviceDeduction = device / 12;
    const netMonthlySalary = adjustedGrossSalary - monthlyTax;
    const remainingAmount = netMonthlySalary;
    const remainingAmountAnnual = remainingAmount * 12;

    return {
      grossMonthlySalary: salary,
      actualDeviceDeduction,
      tax: monthlyTax,
      netMonthlySalary,
      remainingAmount,
      remainingAmountAnnual,
    };
  }, [grossSalary, deviceValue, bestPrice, tortoiseListPrice]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Play Around with Device Benefit Tax Calculator
          </h1>
          <p className="text-gray-600">
            Compare your savings when buying devices via Device Benefit Program.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Input
            type="number"
            label="Gross Annual Salary"
            placeholder="Enter your gross annual salary"
            value={grossSalary}
            onChange={(e) => setGrossSalary(e.target.value)}
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">₹</span>
              </div>
            }
            size="lg"
          />
          <Input
            type="number"
            label="Device Value"
            placeholder="Enter device value"
            value={deviceValue}
            onChange={(e) => {
              setDeviceValue(e.target.value);
              setTortoiseListPrice(e.target.value);
              setBestPrice(e.target.value);
            }}
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">₹</span>
              </div>
            }
            size="lg"
          />
          {/* <Input
            type="number"
            label="Best Price on other E-Commerce Platforms"
            placeholder="Enter Best Price on other E-Commerce Platforms"
            value={bestPrice}
            onChange={(e) => setBestPrice(e.target.value)}
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">₹</span>
              </div>
            }
            size="lg"
          />
          <Input
            type="number"
            label="Tortoise List Price (Including Insurance)"
            placeholder="Enter Tortoise List Price"
            value={tortoiseListPrice}
            onChange={(e) => setTortoiseListPrice(e.target.value)}
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">₹</span>
              </div>
            }
            size="lg"
          /> */}
        </div>

        {/* Savings Summary */}
        {grossSalary && deviceValue && (
          <div className="mb-8 text-center">
            <Card className="bg-green-50 border-green-200">
              <CardBody>
                <div className="text-2xl font-bold text-green-700">
                  Total Savings:{" "}
                  {formatCurrency(
                    (withTortoiseCalcs.remainingAmount -
                      withoutTortoiseCalcs.remainingAmount) *
                      12,
                  )}
                </div>
                <div className="text-lg text-gray-600 mt-2">
                  Monthly Savings via Device Benefit Program:{" "}
                  {formatCurrency(
                    withTortoiseCalcs.remainingAmount -
                      withoutTortoiseCalcs.remainingAmount,
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Column 1: Buying without Tortoise */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <h2 className="text-2xl font-bold text-red-600">
                Buying via eCommerce and Retailers
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Gross Monthly Salary</span>
                <span className="font-bold">
                  {formatCurrency(withoutTortoiseCalcs.grossMonthlySalary)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Tax</span>
                <span className="font-bold text-red-500">
                  -{formatCurrency(withoutTortoiseCalcs.tax)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Net Monthly Salary</span>
                <span className="font-bold">
                  {formatCurrency(withoutTortoiseCalcs.netMonthlySalary)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">
                  Post-Tax Device Deduction (Assuming 0 EMI Cost)
                </span>
                <span className="font-bold text-red-500">
                  -{formatCurrency(withoutTortoiseCalcs.monthlyDeviceDeduction)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
                <span className="font-bold text-lg">
                  Remaining Amount Monthly
                </span>
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(withoutTortoiseCalcs.remainingAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">
                  Remaining Amount Annual
                </span>
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(withoutTortoiseCalcs.remainingAmountAnnual)}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Column 2: Buying with Tortoise */}
          <Card className="h-fit border-2 border-green-200">
            <CardHeader className="pb-4">
              <h2 className="text-2xl font-bold text-green-600">
                Buying via Device Benefit Program
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Gross Monthly Salary</span>
                <span className="font-bold">
                  {formatCurrency(withTortoiseCalcs.grossMonthlySalary)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Pre-Tax Device Deduction</span>
                <span className="font-bold text-orange-500">
                  -{formatCurrency(withTortoiseCalcs.actualDeviceDeduction)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Tax</span>
                <span className="font-bold text-red-500">
                  -{formatCurrency(withTortoiseCalcs.tax)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Net Monthly Salary</span>
                <span className="font-bold">
                  {formatCurrency(withTortoiseCalcs.netMonthlySalary)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
                <span className="font-bold text-lg">
                  Remaining Amount Monthly
                </span>
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(withTortoiseCalcs.remainingAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">
                  Remaining Amount Annual
                </span>
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(withTortoiseCalcs.remainingAmountAnnual)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}