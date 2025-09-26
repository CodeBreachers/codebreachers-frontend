export const telescopicRates = [
    { min: 0, max: 50, rate: 3.35, fixedCharge: 0 },
    { min: 51, max: 100, rate: 4.25, fixedCharge: 0 },
    { min: 101, max: 150, rate: 5.35, fixedCharge: 0 },
    { min: 151, max: 200, rate: 7.2, fixedCharge: 0 },
    { min: 201, max: 250, rate: 8.5, fixedCharge: 0 }
  ];

export const nonTelescopicRates = [
    { min: 0, max: 300, rate: 6.75, fixedCharge: 0 },
    { min: 301, max: 350, rate: 7.6, fixedCharge: 0 },
    { min: 351, max: 400, rate: 7.95, fixedCharge: 0 },
    { min: 401, max: 500, rate: 8.25, fixedCharge: 0 },
    { min: 501, max: Infinity, rate: 9.2, fixedCharge: 0 }
  ];

const calculateTelescopicBill = (units: number) => {
    let totalCost = 0;
    let remainingUnits = units;

    for (const slab of telescopicRates) {
      if (remainingUnits <= 0) break;
      
      const unitsInSlab = Math.min(remainingUnits, slab.max - slab.min + 1);
      const cost = unitsInSlab * slab.rate;
      
      if (unitsInSlab > 0) {
        totalCost += cost;
        remainingUnits -= unitsInSlab;
      }
    }
    return totalCost;
  };

const calculateNonTelescopicBill = (units: number) => {
    const applicableSlab = nonTelescopicRates.find(slab => units >= slab.min && units <= slab.max);
    
    if (applicableSlab) {
      const energyCost = units * applicableSlab.rate;
      const totalCost = energyCost + applicableSlab.fixedCharge;
      return totalCost;
    }
    return 0;
  };

export const calculateElectricityBill = (units: number) => {
    const shouldUseTelescopic = units <= 250;
    
    let bill;
    if (shouldUseTelescopic) {
      bill = calculateTelescopicBill(units);
    } else {
      bill = calculateNonTelescopicBill(units);
    }
    return bill;
}