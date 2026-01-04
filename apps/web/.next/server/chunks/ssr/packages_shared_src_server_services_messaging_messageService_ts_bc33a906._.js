module.exports=[939993,704065,284350,86203,a=>{"use strict";var b=a.i(624486);let c=new class{provider="twilio";async sendMessage(a,c,d){try{let e=await b.twilioClient.sendSMS(a.phoneNumber,c,d);return{messageId:e.sid,status:this.mapTwilioStatus(e.status),provider:this.provider,to:e.to,from:e.from,timestamp:e.dateCreated,metadata:{twilioSid:e.sid,twilioStatus:e.status,errorCode:e.errorCode,errorMessage:e.errorMessage,mediaUrls:d}}}catch(a){throw console.error("TwilioMessagingClient: Failed to send message",a),a}}mapTwilioStatus(a){switch(a){case"sent":case"delivered":return"delivered";case"queued":case"accepted":case"sending":return"queued";case"failed":case"undelivered":return"failed";default:return"sent"}}};var d=a.i(427699);let e=new class{provider="local";eventEmitter;messageCounter=0;constructor(){this.eventEmitter=new d.EventEmitter,this.eventEmitter.setMaxListeners(100)}async sendMessage(a,b,c){let d=`local-${Date.now()}-${++this.messageCounter}`,e=new Date,f=a.phoneNumber;return this.eventEmitter.emit("message",{messageId:d,to:f,from:"local-system",content:b||"[MMS only - no text]",timestamp:e}),console.log("[LocalMessagingClient] Message sent (not actual SMS):",{messageId:d,to:f,userId:a.id,preview:b?b.substring(0,50):"[MMS only]",mediaUrls:c}),{messageId:d,status:"sent",provider:this.provider,to:f,from:"local-system",timestamp:e,metadata:{userId:a.id,phoneNumber:f,contentLength:b?.length||0,mediaUrls:c}}}onMessage(a){this.eventEmitter.on("message",a)}offMessage(a){this.eventEmitter.off("message",a)}getListenerCount(){return this.eventEmitter.listenerCount("message")}};var f=a.i(555977);let g=function(){let{provider:a}=(0,f.getMessagingConfig)();return"local"===a?(console.log("[MessagingFactory] Using LocalMessagingClient (no SMS will be sent)"),e):c}();var h=a.i(34889);a.i(534113);var i=a.i(187361);a.i(458093);var j=a.i(647727);a.i(235570);var k=a.i(56859),l=a.i(239496);let m=j.z.object({feedbackMessage:j.z.string().describe("Message asking for feedback on the past week")}),n=j.z.object({messages:j.z.array(j.z.string()).describe("Array of SMS messages (each under 160 chars)")}),o=`You are a fitness coach sending a weekly check-in message via SMS.

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
}`,p=`
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
`,q=`
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
`;class r{static instance;constructor(){}static getInstance(){return r.instance||(r.instance=new r),r.instance}async generateWelcomeMessage(a){let b=a.name?.split(" ")[0]||"there";return`Hey ${b}!

After you hit "Sign Up," millions of documents were scanned—each with one goal: to build the best plan for your fitness journey.

Then came the planning stage—millions of AI bots mapping, testing, and re-testing until your plan was dialed in. Working to the studs to perfect the product.

Now, as your first workout sends, the bots cheer…then back to work…and we at the GymText family smile as another perfect plan leaves the factory.

Welcome to GymText.

Text me anytime with questions about your workouts, your plan, or if you just need a little extra help!`}async generateWeeklyMessage(a,b,c){let d=(0,k.initializeModel)(m),e=a.name.split(" ")[0],f=`Generate a weekly feedback check-in message for the user.

User Information:
- Name: ${a.name}
- First Name: ${e}
- Week: ${c} of their program

${b?`IMPORTANT: Next week is a DELOAD week - a planned recovery week with reduced intensity.
Acknowledge this positively and remind them that recovery is part of the training process.`:"This is a regular training week."}

Generate the feedback message now.`;return console.log(`[MessagingAgentService] Weekly message user prompt: ${f}`),(await d.invoke([{role:"system",content:o},{role:"user",content:f}])).feedbackMessage}async generatePlanSummary(a,b,c){let d=(0,k.initializeModel)(n),e=c&&c.length>0?`
<Previous Messages>
${c.map(a=>`${"inbound"===a.direction?"User":"Coach"}: ${a.content}`).join("\n\n")}
</Previous Messages>

IMPORTANT: You are continuing a conversation that has already started. DO NOT greet the user by name again. DO NOT introduce yourself again. Just continue naturally with the plan summary.
`:"",f=`
You are a motivational fitness coach sending an exciting SMS message about a new fitness plan.

${e}

<Task>
Create 2-3 SMS messages (each under 160 characters) that summarize this fitness plan in an exciting, motivational way.
</Task>

<User>
Name: ${a.name}
</User>

<Plan Details>
${b.description||"No plan description available."}
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

Now create the motivational SMS messages for ${a.name}'s training program.
`;return(await d.invoke(f)).messages}async generatePlanMicrocycleCombinedMessage(a,b,c){let d=(0,k.initializeModel)(void 0),e=`
Create the "your plan is ready" SMS using the inputs below.
Follow the System Prompt exactly.

[FITNESS PLAN]
${a}

[WEEK 1]
${b}

[TODAY]
${c}

Output ONE medium-length SMS:
- Confirm the plan is ready
- Summarize the plan plainly
- Transition into the week
- Show ONLY the remaining days, each on one short line
- NO em dashes
- Supportive closing line
`.trim();return d.invoke([{role:"system",content:p},{role:"user",content:e}])}async generateUpdatedMicrocycleMessage(a,b,c){let d=(0,k.initializeModel)(void 0),e=l.DAY_NAMES.indexOf(c),f=a.days.slice(e).map((a,b)=>{let c=l.DAY_NAMES[e+b];return`${c}:
${a}`}).join("\n\n"),g=`
Create an "updated week" SMS using the inputs below.
Follow the System Prompt exactly.

[WHAT CHANGED]
${b}

[UPDATED WEEK OVERVIEW]
${a.overview}

[IS DELOAD WEEK]
${a.isDeload}

[REMAINING DAYS]
${f}

[TODAY]
${c}

Output ONE concise SMS:
- Acknowledge the update
- Briefly explain what changed (paraphrase naturally)
- Show ONLY the remaining days, each on one short line
- NO em dashes
- Optional supportive closing
`.trim();return d.invoke([{role:"system",content:q},{role:"user",content:g}])}}let s=r.getInstance();a.s(["messagingAgentService",0,s],704065),a.s([],284350);var t=a.i(449083);class u extends t.BaseRepository{async create(a){return await this.db.insertInto("messages").values(a).returningAll().executeTakeFirstOrThrow()}async findById(a){return await this.db.selectFrom("messages").selectAll().where("id","=",a).executeTakeFirst()}async findByClientId(a,b=50,c=0){return await this.db.selectFrom("messages").selectAll().where("clientId","=",a).orderBy("createdAt","desc").limit(b).offset(c).execute()}async findRecentByClientId(a,b=10){return(await this.db.selectFrom("messages").selectAll().where("clientId","=",a).orderBy("createdAt","desc").limit(b).execute()).reverse()}async countByClientId(a){let b=await this.db.selectFrom("messages").select(({fn:a})=>a.count("id").as("count")).where("clientId","=",a).executeTakeFirst();return Number(b?.count??0)}async findByProviderMessageId(a){return await this.db.selectFrom("messages").selectAll().where("providerMessageId","=",a).executeTakeFirst()}async updateDeliveryStatus(a,b,c){return await this.db.updateTable("messages").set({deliveryStatus:b,deliveryError:c||null,lastDeliveryAttemptAt:new Date}).where("id","=",a).returningAll().executeTakeFirstOrThrow()}async incrementDeliveryAttempts(a){let b=await this.findById(a);if(!b)throw Error(`Message ${a} not found`);return await this.db.updateTable("messages").set({deliveryAttempts:(b.deliveryAttempts||1)+1,lastDeliveryAttemptAt:new Date}).where("id","=",a).returningAll().executeTakeFirstOrThrow()}async updateProviderMessageId(a,b){return await this.db.updateTable("messages").set({providerMessageId:b}).where("id","=",a).returningAll().executeTakeFirstOrThrow()}async findAllWithUserInfo(a){let b=this.db.selectFrom("messages").innerJoin("users","users.id","messages.clientId").select(["messages.id","messages.clientId","messages.conversationId","messages.direction","messages.content","messages.phoneFrom","messages.phoneTo","messages.provider","messages.providerMessageId","messages.deliveryStatus","messages.deliveryAttempts","messages.lastDeliveryAttemptAt","messages.deliveryError","messages.metadata","messages.createdAt","users.name as userName","users.phoneNumber as userPhone"]);a.clientId&&(b=b.where("messages.clientId","=",a.clientId)),a.direction&&(b=b.where("messages.direction","=",a.direction)),a.status&&(b=b.where("messages.deliveryStatus","=",a.status)),a.search&&(b=b.where(b=>b.or([b("messages.phoneFrom","ilike",`%${a.search}%`),b("messages.phoneTo","ilike",`%${a.search}%`),b("users.name","ilike",`%${a.search}%`),b("users.phoneNumber","ilike",`%${a.search}%`)])));let c=this.db.selectFrom("messages").innerJoin("users","users.id","messages.clientId").select(({fn:a})=>a.count("messages.id").as("count"));a.clientId&&(c=c.where("messages.clientId","=",a.clientId)),a.direction&&(c=c.where("messages.direction","=",a.direction)),a.status&&(c=c.where("messages.deliveryStatus","=",a.status)),a.search&&(c=c.where(b=>b.or([b("messages.phoneFrom","ilike",`%${a.search}%`),b("messages.phoneTo","ilike",`%${a.search}%`),b("users.name","ilike",`%${a.search}%`),b("users.phoneNumber","ilike",`%${a.search}%`)])));let d=await c.executeTakeFirst(),e=Number(d?.count??0);return{messages:await b.orderBy("messages.createdAt","desc").limit(a.limit||50).offset(a.offset||0).execute(),total:e}}async getStats(a){let b=this.db.selectFrom("messages");a&&(b=b.where("clientId","=",a));let[c,d,e,f,g]=await Promise.all([b.select(({fn:a})=>a.count("id").as("count")).executeTakeFirst(),b.select(({fn:a})=>a.count("id").as("count")).where("direction","=","inbound").executeTakeFirst(),b.select(({fn:a})=>a.count("id").as("count")).where("direction","=","outbound").executeTakeFirst(),b.select(({fn:a})=>a.count("id").as("count")).where("deliveryStatus","in",["queued","sent"]).executeTakeFirst(),b.select(({fn:a})=>a.count("id").as("count")).where("deliveryStatus","in",["failed","undelivered"]).executeTakeFirst()]);return{totalMessages:Number(c?.count??0),inbound:Number(d?.count??0),outbound:Number(e?.count??0),pending:Number(f?.count??0),failed:Number(g?.count??0)}}}a.s(["MessageRepository",()=>u],86203);var v=a.i(964081),w=a.i(672221),x=a.i(608635),y=a.i(901251);a.i(800525);var z=a.i(877750);class A{static instance;messageRepo;userService;workoutInstanceService;circuitBreaker;constructor(){this.messageRepo=new u(v.postgresDb),this.userService=x.UserService.getInstance(),this.workoutInstanceService=y.WorkoutInstanceService.getInstance(),this.circuitBreaker=new w.CircuitBreaker({failureThreshold:5,resetTimeout:6e4,monitoringPeriod:6e4})}static getInstance(){return A.instance||(A.instance=new A),A.instance}async storeInboundMessage(a){return await this.circuitBreaker.execute(async()=>{let{clientId:b,from:c,to:d,content:e,twilioData:f}=a;return await this.messageRepo.create({conversationId:null,clientId:b,direction:"inbound",content:e,phoneFrom:c,phoneTo:d,provider:"twilio",providerMessageId:f?.MessageSid||null,metadata:f||{}})})}async storeOutboundMessage(a,b,c,d=(0,z.getTwilioSecrets)().phoneNumber,e="twilio",f,g){return await this.circuitBreaker.execute(async()=>await this.userService.getUser(a)?await this.messageRepo.create({conversationId:null,clientId:a,direction:"outbound",content:c,phoneFrom:d,phoneTo:b,provider:e,providerMessageId:f||null,metadata:g||{},deliveryStatus:"queued",deliveryAttempts:1,lastDeliveryAttemptAt:new Date}):null)}async getMessages(a,b=50,c=0){return await this.messageRepo.findByClientId(a,b,c)}async getRecentMessages(a,b=10){return await this.messageRepo.findRecentByClientId(a,b)}splitMessages(a,b){let c=new Date(Date.now()-60*b*1e3),d=-1;for(let b=a.length-1;b>=0;b--)if("outbound"===a[b].direction){d=b;break}return{pending:d>=0?a.slice(d+1):a.filter(a=>"inbound"===a.direction),context:(d>=0?a.slice(0,d+1):[]).filter(a=>new Date(a.createdAt)>=c)}}async getPendingMessages(a){let b=await this.getRecentMessages(a,20),c=[];for(let a=b.length-1;a>=0;a--){let d=b[a];if("outbound"===d.direction)break;"inbound"===d.direction&&c.unshift(d)}return c}async ingestMessage(a){let{user:b,content:c,from:d,to:e,twilioData:f}=a,g=await this.storeInboundMessage({clientId:b.id,from:d,to:e,content:c,twilioData:f});if(!g)throw Error("Failed to store inbound message");let{ids:i}=await h.inngest.send({name:"message/received",data:{userId:b.id,content:c,from:d,to:e}}),j=i[0];return console.log("[MessageService] Message stored and queued:",{userId:b.id,messageId:g.id,jobId:j}),{jobId:j,ackMessage:"",action:"fullChatAgent",reasoning:"Queued for processing"}}async sendMessage(a,b,c){let d=g.provider,e=null;try{(e=await this.storeOutboundMessage(a.id,a.phoneNumber,b||"[MMS only]",void 0,d,void 0,c?{mediaUrls:c}:void 0))||console.warn("Circuit breaker prevented storing outbound message")}catch(a){console.error("Failed to store outbound message:",a)}if(!e)throw Error("Failed to store message");let f=await g.sendMessage(a,b,c);if(f.messageId)try{let a=new u(v.postgresDb);await a.updateProviderMessageId(e.id,f.messageId),console.log("[MessageService] Updated message with provider ID:",{messageId:e.id,providerMessageId:f.messageId})}catch(a){console.error("[MessageService] Failed to update provider message ID:",a)}return"local"===d&&this.simulateLocalDelivery(e.id).catch(a=>{console.error("[MessageService] Local delivery simulation failed:",a)}),e}async simulateLocalDelivery(b){console.log(`[MessageService] Simulating local delivery in 1500ms for message ${b}`),await new Promise(a=>setTimeout(a,1500)),await this.messageRepo.updateDeliveryStatus(b,"delivered");let{messageQueueService:c}=await a.A(205662);await c.markMessageDelivered(b),console.log(`[MessageService] Local delivery simulation complete for message ${b}`)}async sendWelcomeMessage(a){let b=await s.generateWelcomeMessage(a);return await this.sendMessage(a,b)}async sendPlanSummary(a,b,c){let d=await s.generatePlanSummary(a,b,c),e=[];for(let b of d){let c=await this.sendMessage(a,b);e.push(c),d.length>1&&await new Promise(a=>setTimeout(a,500))}if(0===e.length)throw Error("No messages were sent");return e}async sendWorkoutMessage(a,b){let c,d="id"in b?b.id:"unknown";if("message"in b&&b.message)return console.log(`[MessageService] Using pre-generated message from workout ${d}`),c=b.message,await this.sendMessage(a,c);if("description"in b&&"reasoning"in b&&b.description&&b.reasoning){console.log(`[MessageService] Generating fallback message for workout ${d}`);try{let d=await i.workoutAgentService.getMessageAgent();return c=(await d.invoke(b.description)).response,"id"in b&&b.id&&(await this.workoutInstanceService.updateWorkoutMessage(b.id,c),console.log(`[MessageService] Saved fallback message to workout ${b.id}`)),await this.sendMessage(a,c)}catch(a){throw console.error(`[MessageService] Failed to generate fallback message for workout ${d}:`,a),Error("Failed to generate workout message")}}throw Error(`Workout ${d} missing required fields (description/reasoning or message) for SMS generation`)}}let B=A.getInstance();a.s(["MessageService",()=>A,"messageService",0,B],939993)}];

//# sourceMappingURL=packages_shared_src_server_services_messaging_messageService_ts_bc33a906._.js.map