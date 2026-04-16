import { C } from "../../../shared/colors.js";
import { BarChart, LineChart, MultiLineChart, ChartCard, fmtPct, fmtMoney, buildRange } from "../../../shared/Charts.jsx";
import { SS_STAGES, CLOSE_STAGES } from "../constants.js";
import SL from "./SL.jsx";

export default function CloserGraphs({pipeline,history}) {
  const br=d=>buildRange(30).map(r=>({date:r.date,value:pipeline.filter(l=>l.date===r.date&&d(l)).length}));
  const bookedD  = br(()=>true);
  const ssD      = br(l=>SS_STAGES.includes(l.stage));
  const noshowD  = br(l=>l.stage==="noshow");
  const cancelD  = br(l=>l.stage==="cancelled");
  const closedD  = br(l=>CLOSE_STAGES.includes(l.stage));
  const depositD = br(l=>l.stage==="deposit");
  const revenueD   =(history||[]).map(h=>({date:h.date,value:h.revenue||0}));
  const closeRateD =(history||[]).map(h=>({date:h.date,value:h.closeRate||0}));
  const showRateD  =(history||[]).map(h=>({date:h.date,value:h.showRate||0}));
  const oneCallD   =(history||[]).map(h=>({date:h.date,value:h.oneCallRate||0}));
  const G2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:14};
  const G3={display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14};
  return (
    <div style={{maxWidth:980,margin:"0 auto",padding:"28px 24px"}}>
      <SL>Revenue &amp; Cash — EOD History</SL>
      <div style={{marginBottom:14}}><ChartCard><BarChart data={revenueD} color={C.green} barH={140} label="Revenue Collected / Day" format={fmtMoney}/></ChartCard></div>
      <SL>Performance Rates — EOD History</SL>
      <div style={{...G3,marginBottom:14}}>
        <ChartCard><LineChart data={closeRateD} color={C.green} chartH={120} label="Close Rate" format={fmtPct}/><div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4,letterSpacing:"0.1em",marginTop:6}}>TARGET ≥70%</div></ChartCard>
        <ChartCard><LineChart data={showRateD}  color={C.blue}  chartH={120} label="Show Rate"  format={fmtPct}/><div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4,letterSpacing:"0.1em",marginTop:6}}>TARGET ≥75%</div></ChartCard>
        <ChartCard><LineChart data={oneCallD}   color={C.gold}  chartH={120} label="One-Call Close Rate" format={fmtPct}/><div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4,letterSpacing:"0.1em",marginTop:6}}>TARGET ≥90%</div></ChartCard>
      </div>
      <SL>Pipeline Volume — Live Pipeline Data</SL>
      <div style={{...G2,marginBottom:14}}>
        <ChartCard><BarChart data={bookedD}  color={C.gold}   barH={120} label="Calls Booked / Day"/></ChartCard>
        <ChartCard><BarChart data={ssD}      color={C.blue}   barH={120} label="SS Taken / Day"/></ChartCard>
      </div>
      <div style={{...G3,marginBottom:14}}>
        <ChartCard><BarChart data={closedD}  color={C.green}  barH={110} label="Closes / Day"/></ChartCard>
        <ChartCard><BarChart data={depositD} color={C.purple} barH={110} label="Deposits / Day"/></ChartCard>
        <ChartCard>
          <MultiLineChart series={[{label:"No-Show",color:C.red,data:noshowD},{label:"Cancelled",color:C.orange,data:cancelD}]} chartH={110} label="No-Shows + Cancelled"/>
        </ChartCard>
      </div>
    </div>
  );
}
