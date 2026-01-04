module.exports=[80643,884031,249805,e=>{"use strict";e.i(968387);var t=e.i(363690),s=e.i(187070);e.i(331950);var a=e.i(520676);e.i(454188);var n=e.i(331612);e.i(574394);var i=e.i(164476),o=e.i(823525);let r=n.z.object({feedbackMessage:n.z.string().describe("Message asking for feedback on the past week")}),l=n.z.object({messages:n.z.array(n.z.string()).describe("Array of SMS messages (each under 160 chars)")}),c=`You are a fitness coach sending a weekly check-in message via SMS.

Your task is to generate a FEEDBACK MESSAGE asking how their workouts went this past week.

MESSAGE REQUIREMENTS:
- Warm, conversational greeting using their first name
- Ask about their training progress this past week
- Keep it encouraging and supportive
- If next week is a deload week, acknowledge it positively (recovery is important!)
- Keep it around 20-40 words total
- SMS-friendly format

Tone:
- Supportive and motivating
- Concise (SMS format)
- Professional but friendly
- Personal and caring

Format:
Return a JSON object with one field:
{
  "feedbackMessage": "..."
}`,d=`
You are a fitness coach sending a friendly "your plan is ready" message to a new client.

This is the second message they receive:
- The first message went out when they signed up.
- THIS message is sent once their full plan and Week 1 are ready.

Your job is to take:
1) A short "Fitness Plan" summary
2) A short "Week 1" breakdown
and merge them into ONE medium-length SMS.

-----------------------------------------
TONE
-----------------------------------------
- Friendly, confident, human
- No jargon
- Plain-speak, simple phrasing
- SMS-friendly, concise
- Supportive but not overly hyped

-----------------------------------------
CRITICAL LOGIC RULE
-----------------------------------------
You must ONLY show the remaining days of the current week based on the user's signup day.

Input weekday will be one of:
Mon, Tue, Wed, Thu, Fri, Sat, Sun.

Show only today through Sunday. Never show past days.

-----------------------------------------
DAY LINE FORMAT RULES
-----------------------------------------
Every day line must:
- Be VERY short
- Fit on a single phone line with no wrapping
- Use simple wording
- Ideal format examples:
    "Thu: Push + cardio (20–25 min)"
    "Fri: Pull + cardio"
    "Sat: Legs (technique)"
    "Sun: Rest (optional walk)"
- NO em dashes — only colons, hyphens, parentheses, commas, plus signs.
- One simple focus per day.

-----------------------------------------
STRUCTURE & SPACING RULES
-----------------------------------------
Your final SMS must follow this exact structure WITH BLANK LINES between sections:

1. **Opening paragraph (ONE paragraph)**
   - Start with a friendly opener confirming the plan is ready.
   - Immediately continue with a plain-English summary of the full plan.
   - These MUST form a single paragraph with **no blank lines** inside.

2. **Blank line**

3. **Transition sentence**
   - Example: "Here's what the rest of this week looks like:"

4. **Blank line**

5. **Day-by-day list**
   - Only remaining days
   - One day per line
   - Each line must be short

6. **Blank line**

7. **Short supportive closing line**

-----------------------------------------
STRICT RULES
-----------------------------------------
- Output ONLY the final composed SMS
- Must match the spacing described above
- No jargon or technical terms (no RIR, mesocycle, hypertrophy, etc.)
- No em dashes
- No more than 1–2 emojis total
- Keep sentences short
- Paraphrase naturally
`,u=`
You are a fitness coach sending a friendly "your week has been updated" message to a client.

This message is sent when the client requests changes to their training week.

Your job is to take:
1) An explanation of what changed
2) The updated week breakdown
and create ONE concise SMS.

-----------------------------------------
TONE
-----------------------------------------
- Friendly, confident, human
- No jargon
- Plain-speak, simple phrasing
- SMS-friendly, concise
- Supportive and responsive to their request

-----------------------------------------
CRITICAL LOGIC RULE
-----------------------------------------
You must ONLY show the remaining days of the current week based on the current day.

Input weekday will be one of:
Mon, Tue, Wed, Thu, Fri, Sat, Sun.

Show only today through Sunday. Never show past days.

-----------------------------------------
DAY LINE FORMAT RULES
-----------------------------------------
Every day line must:
- Be VERY short
- Fit on a single phone line with no wrapping
- Use simple wording
- NO em dashes — only colons, hyphens, parentheses, commas, plus signs.
- Keep each day to one simple focus.

-----------------------------------------
SESSION NAME SIMPLIFICATION
-----------------------------------------
Translate technical terms into plain English:
- Push → Chest & Shoulders
- Pull → Back & Arms
- Upper → Upper Body
- Lower → Lower Body
- Legs / Legs & Glutes → Lower Body
- Active Recovery → Light Movement
- Rest / Off → Rest Day
- Deload → Recovery Day

No jargon terms: hypertrophy, mesocycle, microcycle, RIR, RPE, volume, intensity, etc.

-----------------------------------------
STRUCTURE
-----------------------------------------
Your final SMS must follow this structure:

1. Friendly acknowledgment of the update
2. Brief explanation of what changed (1–2 sentences)
3. Remaining days breakdown (today through Sunday)
4. Optional short supportive closing (if space allows)

-----------------------------------------
STRICT RULES
-----------------------------------------
- Output ONLY the final composed SMS
- No jargon or technical terms
- No em dashes
- No more than 1 emoji total (or none)
- Keep sentences short
- Paraphrase the modifications explanation naturally
- Show ONLY remaining days
`;class g{static instance;constructor(){}static getInstance(){return g.instance||(g.instance=new g),g.instance}async generateWelcomeMessage(e){let t=e.name?.split(" ")[0]||"there";return`Hey ${t}!

After you hit "Sign Up," millions of documents were scanned—each with one goal: to build the best plan for your fitness journey.

Then came the planning stage—millions of AI bots mapping, testing, and re-testing until your plan was dialed in. Working to the studs to perfect the product.

Now, as your first workout sends, the bots cheer…then back to work…and we at the GymText family smile as another perfect plan leaves the factory.

Welcome to GymText.

Text me anytime with questions about your workouts, your plan, or if you just need a little extra help!`}async generateWeeklyMessage(e,t,s){let a=(0,i.initializeModel)(r),n=e.name.split(" ")[0],o=`Generate a weekly feedback check-in message for the user.

User Information:
- Name: ${e.name}
- First Name: ${n}
- Week: ${s} of their program

${t?`IMPORTANT: Next week is a DELOAD week - a planned recovery week with reduced intensity.
Acknowledge this positively and remind them that recovery is part of the training process.`:"This is a regular training week."}

Generate the feedback message now.`;return console.log(`[MessagingAgentService] Weekly message user prompt: ${o}`),(await a.invoke([{role:"system",content:c},{role:"user",content:o}])).feedbackMessage}async generatePlanSummary(e,t,s){let a=(0,i.initializeModel)(l),n=s&&s.length>0?`
<Previous Messages>
${s.map(e=>`${"inbound"===e.direction?"User":"Coach"}: ${e.content}`).join("\n\n")}
</Previous Messages>

IMPORTANT: You are continuing a conversation that has already started. DO NOT greet the user by name again. DO NOT introduce yourself again. Just continue naturally with the plan summary.
`:"",o=`
You are a motivational fitness coach sending an exciting SMS message about a new fitness plan.

${n}

<Task>
Create 2-3 SMS messages (each under 160 characters) that summarize this fitness plan in an exciting, motivational way.
</Task>

<User>
Name: ${e.name}
</User>

<Plan Details>
${t.description||"No plan description available."}
</Plan Details>

<Guidelines>
- Keep each message under 160 characters (SMS limit)
- Be enthusiastic and motivational
- Focus on what the plan will do for them (outcomes, not just structure)
- Mention the training split and key focuses from the plan
- Make them excited to start
- Use conversational, friendly tone
- Don't use emojis unless they help save characters
- Number the messages if multiple (e.g., "1/3:", "2/3:")

<Output Format>
Return a JSON object with an array of messages:
{
  "messages": [
    "Message 1 text here...",
    "Message 2 text here...",
    "Message 3 text here (if needed)..."
  ]
}
</Output Format>

Now create the motivational SMS messages for ${e.name}'s training program.
`;return(await a.invoke(o)).messages}async generatePlanMicrocycleCombinedMessage(e,t,s){let a=(0,i.initializeModel)(void 0),n=`
Create the "your plan is ready" SMS using the inputs below.
Follow the System Prompt exactly.

[FITNESS PLAN]
${e}

[WEEK 1]
${t}

[TODAY]
${s}

Output ONE medium-length SMS:
- Confirm the plan is ready
- Summarize the plan plainly
- Transition into the week
- Show ONLY the remaining days, each on one short line
- NO em dashes
- Supportive closing line
`.trim();return a.invoke([{role:"system",content:d},{role:"user",content:n}])}async generateUpdatedMicrocycleMessage(e,t,s){let a=(0,i.initializeModel)(void 0),n=o.DAY_NAMES.indexOf(s),r=e.days.slice(n).map((e,t)=>{let s=o.DAY_NAMES[n+t];return`${s}:
${e}`}).join("\n\n"),l=`
Create an "updated week" SMS using the inputs below.
Follow the System Prompt exactly.

[WHAT CHANGED]
${t}

[UPDATED WEEK OVERVIEW]
${e.overview}

[IS DELOAD WEEK]
${e.isDeload}

[REMAINING DAYS]
${r}

[TODAY]
${s}

Output ONE concise SMS:
- Acknowledge the update
- Briefly explain what changed (paraphrase naturally)
- Show ONLY the remaining days, each on one short line
- NO em dashes
- Optional supportive closing
`.trim();return a.invoke([{role:"system",content:u},{role:"user",content:l}])}}let h=g.getInstance();e.s(["messagingAgentService",0,h],884031),e.s([],249805);var m=e.i(501261),p=e.i(36480),y=e.i(39917),w=e.i(565431),S=e.i(125720);e.i(791146);var f=e.i(832821);class v{static instance;messageRepo;userService;workoutInstanceService;circuitBreaker;constructor(){this.messageRepo=new m.MessageRepository(p.postgresDb),this.userService=w.UserService.getInstance(),this.workoutInstanceService=S.WorkoutInstanceService.getInstance(),this.circuitBreaker=new y.CircuitBreaker({failureThreshold:5,resetTimeout:6e4,monitoringPeriod:6e4})}static getInstance(){return v.instance||(v.instance=new v),v.instance}async storeInboundMessage(e){return await this.circuitBreaker.execute(async()=>{let{clientId:t,from:s,to:a,content:n,twilioData:i}=e;return await this.messageRepo.create({conversationId:null,clientId:t,direction:"inbound",content:n,phoneFrom:s,phoneTo:a,provider:"twilio",providerMessageId:i?.MessageSid||null,metadata:i||{}})})}async storeOutboundMessage(e,t,s,a=(0,f.getTwilioSecrets)().phoneNumber,n="twilio",i,o){return await this.circuitBreaker.execute(async()=>await this.userService.getUser(e)?await this.messageRepo.create({conversationId:null,clientId:e,direction:"outbound",content:s,phoneFrom:a,phoneTo:t,provider:n,providerMessageId:i||null,metadata:o||{},deliveryStatus:"queued",deliveryAttempts:1,lastDeliveryAttemptAt:new Date}):null)}async getMessages(e,t=50,s=0){return await this.messageRepo.findByClientId(e,t,s)}async getRecentMessages(e,t=10){return await this.messageRepo.findRecentByClientId(e,t)}splitMessages(e,t){let s=new Date(Date.now()-60*t*1e3),a=-1;for(let t=e.length-1;t>=0;t--)if("outbound"===e[t].direction){a=t;break}return{pending:a>=0?e.slice(a+1):e.filter(e=>"inbound"===e.direction),context:(a>=0?e.slice(0,a+1):[]).filter(e=>new Date(e.createdAt)>=s)}}async getPendingMessages(e){let t=await this.getRecentMessages(e,20),s=[];for(let e=t.length-1;e>=0;e--){let a=t[e];if("outbound"===a.direction)break;"inbound"===a.direction&&s.unshift(a)}return s}async ingestMessage(e){let{user:t,content:a,from:n,to:i,twilioData:o}=e,r=await this.storeInboundMessage({clientId:t.id,from:n,to:i,content:a,twilioData:o});if(!r)throw Error("Failed to store inbound message");let{ids:l}=await s.inngest.send({name:"message/received",data:{userId:t.id,content:a,from:n,to:i}}),c=l[0];return console.log("[MessageService] Message stored and queued:",{userId:t.id,messageId:r.id,jobId:c}),{jobId:c,ackMessage:"",action:"fullChatAgent",reasoning:"Queued for processing"}}async sendMessage(e,s,a){let n=t.messagingClient.provider,i=null;try{(i=await this.storeOutboundMessage(e.id,e.phoneNumber,s||"[MMS only]",void 0,n,void 0,a?{mediaUrls:a}:void 0))||console.warn("Circuit breaker prevented storing outbound message")}catch(e){console.error("Failed to store outbound message:",e)}if(!i)throw Error("Failed to store message");let o=await t.messagingClient.sendMessage(e,s,a);if(o.messageId)try{let e=new m.MessageRepository(p.postgresDb);await e.updateProviderMessageId(i.id,o.messageId),console.log("[MessageService] Updated message with provider ID:",{messageId:i.id,providerMessageId:o.messageId})}catch(e){console.error("[MessageService] Failed to update provider message ID:",e)}return"local"===n&&this.simulateLocalDelivery(i.id).catch(e=>{console.error("[MessageService] Local delivery simulation failed:",e)}),i}async simulateLocalDelivery(t){console.log(`[MessageService] Simulating local delivery in 1500ms for message ${t}`),await new Promise(e=>setTimeout(e,1500)),await this.messageRepo.updateDeliveryStatus(t,"delivered");let{messageQueueService:s}=await e.A(279524);await s.markMessageDelivered(t),console.log(`[MessageService] Local delivery simulation complete for message ${t}`)}async sendWelcomeMessage(e){let t=await h.generateWelcomeMessage(e);return await this.sendMessage(e,t)}async sendPlanSummary(e,t,s){let a=await h.generatePlanSummary(e,t,s),n=[];for(let t of a){let s=await this.sendMessage(e,t);n.push(s),a.length>1&&await new Promise(e=>setTimeout(e,500))}if(0===n.length)throw Error("No messages were sent");return n}async sendWorkoutMessage(e,t){let s,n="id"in t?t.id:"unknown";if("message"in t&&t.message)return console.log(`[MessageService] Using pre-generated message from workout ${n}`),s=t.message,await this.sendMessage(e,s);if("description"in t&&"reasoning"in t&&t.description&&t.reasoning){console.log(`[MessageService] Generating fallback message for workout ${n}`);try{let n=await a.workoutAgentService.getMessageAgent();return s=(await n.invoke(t.description)).response,"id"in t&&t.id&&(await this.workoutInstanceService.updateWorkoutMessage(t.id,s),console.log(`[MessageService] Saved fallback message to workout ${t.id}`)),await this.sendMessage(e,s)}catch(e){throw console.error(`[MessageService] Failed to generate fallback message for workout ${n}:`,e),Error("Failed to generate workout message")}}throw Error(`Workout ${n} missing required fields (description/reasoning or message) for SMS generation`)}}let M=v.getInstance();e.s(["MessageService",()=>v,"messageService",0,M],80643)}];

//# sourceMappingURL=packages_shared_src_server_services_messaging_messageService_ts_7e2e56ec._.js.map