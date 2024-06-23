import { ReactNode } from "react"
import "./stats.css"
import React from "react"
import Chart from "react-google-charts";
import Label from "./label";
import { EmotionalVector, IEmotionalVector } from "../../model/common";
import { Charts } from "../emotion/emotion";

enum Tabs {
    content_creating = "Content creating",
    content_assessing = "Content assessing",
    user_assessments = "User assessments",
};

enum GroupBy {
    location = "location",
    age = "age",
    language = "language",
    gender = "gender"
}

export interface IStatsProps {
    stats: any;
}

export interface IStatsState {
    curTab?: Tabs;
    filters?: any;
    groupby?: GroupBy;
}

export default class Stats extends React.Component<IStatsProps, IStatsState> {
    //for Calendar of creation
    private dataCountCreationByDate: any[] = [];
    
    //for Calendar of assessments
    private dataCountAssessmentsByDate: any[] = [];
        
    private avgVectorsByItems: {cid: string, vector: IEmotionalVector, count: number}[] = [];

    private avgVector = new EmotionalVector();

    private avgVectorByUser: {uid: string, vector: IEmotionalVector, count: number}[] = [];

    private dataUsersByLanguage: any[] = [];
    private dataUsersByGender: any[] = [];
    private dataUsersByAge: any[] = [];
    
    state: IStatsState = {
        curTab: Tabs.content_creating,
    }
    componentDidUpdate(prevProps: Readonly<IStatsProps>, prevState: Readonly<IStatsState>, snapshot?: any): void {
    }
    private prepareData(){
        const stats = this.props.stats;
        if (stats === undefined) return;
        
        //
        this.dataCountCreationByDate = [[
            {type: "date",id: "day",
            }, {type: "number",id: "Count",
            },
        ],];
        stats.contents.forEach((ci: any)=>{
            const datewotimecreated = new Date(ci.created.toDateString());
            const datewotimechanged = new Date(ci.changed.toDateString());
            let foundDate = this.dataCountCreationByDate.slice(1).findIndex((elem: any)=>datewotimecreated.getDate() === elem[0].getDate());
            if (foundDate === -1) this.dataCountCreationByDate.push([datewotimecreated, 1]);
            else this.dataCountCreationByDate[foundDate+1][1] += 1;
            foundDate = this.dataCountCreationByDate.slice(1).findIndex((elem: any)=>datewotimechanged.getDate() === elem[0].getDate());
            if (foundDate === -1) this.dataCountCreationByDate.push([datewotimechanged, 1]);
            else this.dataCountCreationByDate[foundDate+1][1] += 1;
        });

        //
        this.dataCountAssessmentsByDate = [[
            {type: "date",id: "day",
            },{type: "number",id: "Count",
            },
        ],];
        stats.assessments.forEach((a: any)=>{
            const datewotimecreated = new Date(a.created.toDateString());
            const foundDate = this.dataCountAssessmentsByDate.slice(1).findIndex((elem: any)=>datewotimecreated.getDate() === elem[0].getDate());
            if (foundDate === -1) this.dataCountAssessmentsByDate.push([datewotimecreated, 1]);
            else this.dataCountAssessmentsByDate[foundDate+1][1] += 1;
        });

        //Average vectors by item and by user
        this.avgVectorsByItems = [];
        this.avgVectorByUser = [];
        stats.assessments.forEach((a: any)=>{
            const foundC = this.avgVectorsByItems.findIndex(el=>el.cid === a.cid);
            if (foundC !== -1) {
                const newV = new EmotionalVector(a.vector);
                const oldV = new EmotionalVector(this.avgVectorsByItems[foundC].vector);
                oldV.mult(this.avgVectorsByItems[foundC].count);
                oldV.add(newV);
                oldV.mult(1 / (this.avgVectorsByItems[foundC].count + 1));
                this.avgVectorsByItems[foundC].count += 1;
                this.avgVectorsByItems[foundC].vector = oldV as IEmotionalVector;
            } else this.avgVectorsByItems.push({cid: a.cid, vector: a.vector, count: 1});

            const foundU = this.avgVectorByUser.findIndex(el=>el.uid === a.uid);
            if (foundU !== -1) {
                const newV = new EmotionalVector(a.vector);
                const oldV = new EmotionalVector(this.avgVectorByUser[foundU].vector);
                oldV.mult(this.avgVectorByUser[foundU].count);
                oldV.add(newV);
                oldV.mult(1 / (this.avgVectorByUser[foundU].count + 1));
                this.avgVectorByUser[foundU].count += 1;
                this.avgVectorByUser[foundU].vector = oldV as IEmotionalVector;
            } else this.avgVectorByUser.push({uid: a.uid, vector: a.vector, count: 1});
        });
        //console.log(`this.avgVectorsByItems = ${this.avgVectorsByItems.length}`)

        //average vector of set
        this.avgVector = new EmotionalVector();
        if (this.avgVectorsByItems.length !== 0) {
            this.avgVectorsByItems.forEach(avEmVector=>{this.avgVector.add(avEmVector.vector)});
            this.avgVector.mult(1 / this.avgVectorsByItems.length);
        }

        this.dataUsersByLanguage = [
            ["Language", "Count"],
        ];
        stats.users.forEach((u: any)=>{
            const foundLang = this.dataUsersByLanguage.slice(1).findIndex((elem: any)=>elem[0] === u.nativelanguage);
            if (foundLang === -1) this.dataUsersByLanguage.push([u.nativelanguage, 1]);
            else this.dataUsersByLanguage[foundLang+1][1] += 1;
        });

        this.dataUsersByGender = [
            ["Gender", "Count"],
        ];
        stats.users.forEach((u: any)=>{
            const foundGender = this.dataUsersByGender.slice(1).findIndex((elem: any)=>elem[0] === (u.gender?u.gender:"empty"));
            if (foundGender === -1) this.dataUsersByGender.push([u.gender?u.gender:"empty", 1]);
            else this.dataUsersByGender[foundGender+1][1] += 1;
        });
        
        this.dataUsersByAge = [
            ["Age", "Count"],
        ];
        stats.users.forEach((u: any)=>{
            const age = u.birthdate?(new Date().getDate() - new Date (u.birthdate).getDate())*1000/365.25:undefined;
            const foundAge = this.dataUsersByAge.slice(1).findIndex((elem: any)=>elem[0] === (age?`${age-age%10}-${age-age%10+9}`:"empty"));
            if (foundAge === -1) this.dataUsersByAge.push([age?`${age-age%10}-${age-age%10+9}`:"empty", 1]);
            else this.dataUsersByAge[foundAge+1][1] += 1;
        });
    }
    renderContentCreating(): ReactNode {
        this.prepareData();

        const stats = this.props.stats;
        if (stats === undefined) return <></>;

        return <div className="stats-content_creating-container">
            <Label gridArea="created" caption="set created" value={stats.organizations[0].created.toDateString()}/>
            <Label gridArea="count" caption="content items" value={stats.contents.length}/>
            <span style={{gridArea: "calendar"}}>
                <Chart chartType="Calendar" width="100%" height="350px" data={this.dataCountCreationByDate} options={{title: "Content created and changed by date"}}/>
            </span>
        </div>
    }

    renderContentAssessing(): ReactNode {
        this.prepareData();
        const stats = this.props.stats;
        if (stats === undefined) return <></>;
        

        return <div className='stats-content_assessing-container'>
            <Label gridArea="created" caption="set created" value={stats.organizations[0].created.toDateString()}/>
            <Label gridArea="count-content" caption="content items" value={stats.contents.length}/>
            <Label gridArea="count-assessments" caption="assessments" value={stats.assessments.length}/>
            <Label gridArea="count-content-assessed" caption="assessed items" value={this.avgVectorsByItems.length.toString()}/>
            <Charts label="Average emotional vector of set" vector={this.avgVector} gridArea="avg-vector"/>
            <span style={{gridArea:"calendar"}}>
                <Chart chartType="Calendar" width={"100%"} height={"350px"} data={this.dataCountAssessmentsByDate} options={{ title: "Assessments count by date" }} />
            </span>
        </div>
    }

    renderUserAssessments(): ReactNode {
        this.prepareData();
        const stats = this.props.stats;
        if (stats === undefined) return <></>;
        

        return <div className='stats-user_assessmennts-container'>
            <span style={{gridArea: "pie-age"}}>
                <Chart chartType="PieChart" data={this.dataUsersByAge} width={"100%"} height={"100%"} options={{title: "Users' age"}}/>
            </span>
            <span style={{gridArea: "pie-gender"}}>
                <Chart chartType="PieChart" data={this.dataUsersByGender} width={"100%"} height={"100%"} options={{title: "Users' gender"}}/>
            </span>
            <span style={{gridArea: "pie-language"}}>
                <Chart chartType="PieChart" data={this.dataUsersByLanguage} width={"100%"} height={"100%"} options={{title: "Users' language"}}/>
            </span>
            <Charts gridArea="avg-vector" vector={this.avgVector} label="Average emotional vector of set"/>
            <Label gridArea="count-assessments" caption="assessments" value={stats.assessments.length}/>
            <Label gridArea="count-users" caption="users" value={this.avgVectorByUser.length.toString()}/>
            <span style={{gridArea: "content-items"}}>

            </span>
        </div>
    }

    render(): ReactNode {
        return <div className="stats-container">
            <span className="stats-container-label">Stats</span>
            <div className="stats-filters-bar">
                {/**Content assessing */}
                {this.state.curTab === Tabs.content_assessing?<></>:
                /**Content creating */
                this.state.curTab === Tabs.content_creating?<></>:
                /**Content creating */
                this.state.curTab === Tabs.user_assessments?<>
                </>:
                /** Unknown ??? */
                <></>}
            </div>
            <div className="stats-content-container">
                {/**Content assessing */}
                {this.state.curTab === Tabs.content_assessing?this.renderContentAssessing():
                /**Content creating */
                this.state.curTab === Tabs.content_creating?this.renderContentCreating():
                /**Content creating */
                this.state.curTab === Tabs.user_assessments?this.renderUserAssessments():
                /** Unknown ??? */
                <></>}
            </div>
            <div className="stats-tabs-container">
                <span>{`Visuals >`}</span>
                {Object.entries(Tabs).map((v, i) => <span onClick={event => {
                    const nState: IStatsState = this.state;
                    nState.curTab = v[1];
                    this.setState(nState);
                }} className={`stats-tab-label ${this.state.curTab === v[1] ? "selected" : ""}`} key={i}>{v[1]}</span>)}

            </div>
        </div>
    }
}