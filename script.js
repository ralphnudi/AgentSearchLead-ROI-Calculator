function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function toggleFranchiseFee() {
    const toggle = document.getElementById('franchiseFeeToggle').value;
    document.getElementById('franchiseFeeInput').style.display = toggle === 'yes' ? 'block' : 'none';
}

function toggleAnnualCap() {
    const toggle = document.getElementById('annualCapToggle').value;
    document.getElementById('annualCapInput').style.display = toggle === 'yes' ? 'block' : 'none';
}

function toggleISA() {
    const toggle = document.getElementById('isaToggle').value;
    document.getElementById('isaInput').style.display = toggle === 'yes' ? 'block' : 'none';
}

function calculateROI() {
    const leadsPerMonth = parseFloat(document.getElementById('leadsPerMonth').value);
    const remarketingCostPerLead = parseFloat(document.getElementById('remarketingPlan').value);
    const avgHomeSalePrice = parseFloat(document.getElementById('avgHomeSalePrice').value);
    const commissionRate = parseFloat(document.getElementById('commissionRate').value) / 100;

    const franchiseFeeToggle = document.getElementById('franchiseFeeToggle').value === 'yes';
    const franchiseFee = franchiseFeeToggle ? parseFloat(document.getElementById('franchiseFee').value) / 100 : 0;

    const annualCapToggle = document.getElementById('annualCapToggle').value === 'yes';
    const annualCap = annualCapToggle ? parseFloat(document.getElementById('annualCap').value) : Infinity;

    const isaToggle = document.getElementById('isaToggle').value === 'yes';
    const isaBudget = isaToggle ? parseFloat(document.getElementById('isaBudget').value) : 0;

    const commissionSplit = parseFloat(document.getElementById('commissionSplit').value) / 100;
    const transactionFee = parseFloat(document.getElementById('transactionFee').value);
    const monthlyFees = parseFloat(document.getElementById('monthlyFees').value);

    let costPerLead;
    if (leadsPerMonth <= 100) costPerLead = 2.50;
    else if (leadsPerMonth <= 500) costPerLead = 2.00;
    else if (leadsPerMonth <= 1000) costPerLead = 1.75;
    else costPerLead = 1.50;

    const totalLeadCost = leadsPerMonth * costPerLead;
    const totalRemarketingCost = leadsPerMonth * remarketingCostPerLead;
    const totalISACost = isaBudget;
    const totalMonthlyCost = totalLeadCost + totalRemarketingCost + totalISACost;
    const totalAnnualCost = totalMonthlyCost * 12;

    const averageLeadPrice = totalLeadCost / leadsPerMonth;

    let conversionRate = remarketingCostPerLead === 0 ? 0.01 : remarketingCostPerLead === 4 ? 0.02 : 0.03;
    const monthlyClosings = leadsPerMonth * conversionRate;
    const annualClosings = monthlyClosings * 12;

    const monthlyClosedVolume = monthlyClosings * avgHomeSalePrice;
    const annualClosedVolume = monthlyClosedVolume * 12;
    const monthlyGCI = monthlyClosedVolume * commissionRate;
    const annualGCI = monthlyGCI * 12;

    const franchiseDeduction = annualGCI * franchiseFee;
    const grossBrokerageRevenue = annualGCI - franchiseDeduction;

    // Fixed Split Logic
    const companySplit = 1 - commissionSplit;
    let companyCommission;

    if (annualCapToggle) {
        companyCommission = Math.min(grossBrokerageRevenue * companySplit, annualCap);
    } else {
        companyCommission = grossBrokerageRevenue * companySplit;
    }

    const agentRevenueBeforeFees = grossBrokerageRevenue - companyCommission;

    const totalTransactionFees = transactionFee * annualClosings;
    const totalAnnualFees = monthlyFees * 12;

    const totalAgentRevenue = agentRevenueBeforeFees - (totalTransactionFees + totalAnnualFees);

    const totalProfit = totalAgentRevenue - totalAnnualCost;
    const roiPercentage = (totalProfit / totalAnnualCost) * 100;

    // Display Results
    document.getElementById('result').innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Monthly</th>
                    <th>Annual</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Cost Per Lead</td>
                    <td>${formatCurrency(averageLeadPrice)}</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Total Lead Cost</td>
                    <td>${formatCurrency(totalLeadCost)}</td>
                    <td>${formatCurrency(totalLeadCost * 12)}</td>
                </tr>
                <tr>
                    <td>Remarketing Cost</td>
                    <td>${formatCurrency(totalRemarketingCost)}</td>
                    <td>${formatCurrency(totalRemarketingCost * 12)}</td>
                </tr>
                <tr>
                    <td>ISA Cost</td>
                    <td>${formatCurrency(totalISACost)}</td>
                    <td>${formatCurrency(totalISACost * 12)}</td>
                </tr>
                <tr>
                    <td>Total Monthly Cost</td>
                    <td>${formatCurrency(totalMonthlyCost)}</td>
                    <td>${formatCurrency(totalAnnualCost)}</td>
                </tr>
                <tr>
                    <td>Number of Units (Closings)</td>
                    <td>${monthlyClosings.toFixed(2)}</td>
                    <td>${annualClosings.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Sales Volume</td>
                    <td>${formatCurrency(monthlyClosedVolume)}</td>
                    <td>${formatCurrency(annualClosedVolume)}</td>
                </tr>
                <tr>
                    <td>Gross Commission Income (GCI)</td>
                    <td>${formatCurrency(monthlyGCI)}</td>
                    <td>${formatCurrency(annualGCI)}</td>
                </tr>
                <tr>
                    <td>Agent Commission Earned</td>
                    <td>${formatCurrency(totalAgentRevenue / 12)}</td>
                    <td>${formatCurrency(totalAgentRevenue)}</td>
                </tr>
            </tbody>
        </table>
        <div class="roi">
            ROI: ${roiPercentage.toFixed(2)}%
        </div>
    `;
}