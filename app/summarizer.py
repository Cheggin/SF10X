from typing import List
from app import file_utils
from app.constants import ModelName
from app.llm_generator import LLMGenerator
from app.schemas.schema import SummarizationResponse
from dotenv import load_dotenv

load_dotenv(dotenv_path='../local.env')

class Summarizer:
    def __init__(
            self,
            transcript_file_path: str,
            agenda_for_the_meetings: List[str],
            model_name: ModelName,
    ):
        self.transcript_content = file_utils.read_txt_file(transcript_file_path)
        self.agenda_for_the_meetings = agenda_for_the_meetings
        self.model_name = model_name
        self.llm_generator = LLMGenerator(
            foundational_models=[model_name],
            task_name="Transcript Summarization",
            system_prompt_path="./prompts/summarization_system_prompt.txt",
            user_prompt_path="./prompts/summarization_user_prompt.txt",
            llm_metadata={
                'transcript': self.transcript_content,
                'agenda_for_the_meeting': self.agenda_for_the_meetings,
                'schema': SummarizationResponse.model_json_schema()
            },
            structured_output_model=SummarizationResponse

        )

    def summarize(self) -> SummarizationResponse:
        llm_response = self.llm_generator.__call__()
        summa_response = llm_response[self.model_name.value]
        return SummarizationResponse.model_validate(summa_response)

agendas = ['1 ROLL CALL AND PLEDGE OF ALLEGIANCE', '2 COMMUNICATIONS', '3 APPROVAL OF MEETING MINUTES', '4 CONSENT AGENDA[Consent Boiler|B1]', 'Items 1 through 23', '250509 Administrative Code - Procurement of Goods and Services', '250574 Settlement of Lawsuit - Archdiocese of San Francisco Parish and School Juridic Persons Real Property Support Corporation - $247,500', '250699 Administrative Code - Real Time Investigation Center - Waiving Solicitation Requirements For Procurements Using Gift Funds From San Francisco Police Community Foundation', '250715 Administrative Code - Regional Vehicle Interdiction Desk Grant Program - Waiving Competitive Solicitation Requirements for Procurements Using Grant Funds', '250722 Accept and Expend In-Kind Gift - Retroactive - Ripple Labs, Inc. - Office Space - Estimated Market Value of $2,131,543', '250723 Accept and Expend In-Kind Gift - Retroactive - San Francisco Police Community Foundation - Fiber Internet Service, Dro...Data Software, Parking Fees - Estimated Market Value of $7,250,028 and Future Gifts to Support the Real Time Investigation Cen', '250487 Administrative Code - Equitable Citywide Access to Shelters, Transitional Housing, and Behavioral Health Services', '7 SPECIAL ORDER 2:30 P.M. - Recognition of Commendations', '7 SPECIAL ORDER 3:00 P.M.', '250735 Hearing - Appeal of Tentative Parcel Map Approval - 1979 Mission Street', '250736 Approving Decision of Public Works and Approving Tentative Parcel Map - 1979 Mission Street', '250737 Conditionally Disapproving Decision of Public Works and Disapproving Tentative Parcel Map - 1979 Mission Street', '250738 Preparation of Findings Related to Tentative Parcel Map - 1979 Mission Street', '250515 Agreement Amendment - San Francisco Health Plan - CalAIM Community Supports - Anticipated Revenue to the City Not to Exceed $6,039,300', '250516 Agreement Amendment - San Francisco Health Plan - Enhanced Care Management Fee For Services - Anticipated Revenue Not to Exceed $3,944,000', '250514 Grant Agreement Amendment - Institute on Aging - Community Living Fund Program - Not to Exceed $25,676,683', '250579 Grant Agreement - Self-Help for the Elderly - Congregate Nutrition Services for Older Adults - Not to Exceed $11,125,299', '250580 Grant Agreement - Self-Help for the Elderly - Home-Delivered Nutrition Services for Older Adults Program - Not to Exceed $13,871,295', '250652 Real Property Lease - TEC of California, Inc. - Pier 80 - Not to Exceed $2,735,362', '250673 Real Property Lease - Retroactive - Autodesk Inc. - Pier 9, Suite 116, and Bays 1-3 - Monthly Rent $147,018.12', "250689 Mutual Termination Agreement of Real Property - Smokehouse - Scoma's Restaurant", '250745 Accept and Expend Grant - California State Transportation Agency - Pier 80 Subsidence Project - $12,420,000', '250703 Accept and Expend Grant - Retroactive - Jobs for the Future - Rapid Information Technology Employment Initiative (RITEI) - $679,000', '250712 Participation Costs for CleanPowerSF Membership - California Community Power Authority - Not to Exceed $8,286,095', '250725 Accept and Expend Grant - Retroactive - National Institutes of Health - Fred Hutchinson Cancer Center - Statistical Methods for Advancing HIV Prevention - $105,832', '250743 Accept and Expend Grant - Retroactive - National Institutes of Health - Family Health International - HIV Prevention Trials Network - $108,968', '250742 Grant Agreement - 180 Jones Associates, L.P. - Affordable Housing Operating Subsidy - Not to Exceed $5,980,012', '250732 Amendment to Professional Services Contract Agreement - WCG, Inc. (West Coast Consulting Group) - Software Development of the New Legislative Management System - Board of Supervisors - Not to Exceed $3,190,476', "250325 Sheriff's Department Oversight Board - First Quarter Report - Calendar Year 2024", "250326 Sheriff's Department Oversight Board - Second Quarter Report - Calendar Year 2024", "250327 Sheriff's Department Oversight Board - Third Quarter Report - Calendar Year 2024", "250328 Sheriff's Department Oversight Board - Fourth Quarter Report - Calendar Year 2024", "250329 Sheriff's Department Oversight Board - Annual Report - Calendar Year 2024", '250362 Law Enforcement Equipment Use Policy - 2024 Annual Report', '250512 Memorandum of Understanding - Retroactive - California Department of State Hospitals and California Mental Health Services Authority - State Hospital Beds - Not to Exceed $10,000,000', '250547 Accept and Expend Grant - Retroactive - Metropolitan Transportation Commission - Parking Management Capital Grant - $200,000', '250706 Acceptance of Tobacco Settlement Funds - Designation of Authorized Officers', "250191 Planning and Building Codes - Amnesty for Properties in the Department of Building Inspection's Internal Quality Control Audit", '240796 Administrative Code - Ban on Automated Rent-Setting', '240803 Planning, Building Codes - Unauthorized and Rent-Controlled Dwelling Units', '250634 Planning Code - Use Size Limits', '250702 Building Code - All-Electric Major Renovations', '250760 Commemorative Plaques - San Francisco Little Italy Honor Walk Expansion', '250753 Administrative Code - Food Purchasing for Hospitals and Jails', "250586 Appointments, Citizen's Committee on Community Development", '250750 Mayoral Appointment, Historic Preservation Commission - Eleanor Cox', '9 ROLL CALL FOR INTRODUCTIONS [Roll Call Boiler|B1, B2]', '10 PUBLIC COMMENT [Public Comment Boiler|B1, B2, N1]', '12 FOR ADOPTION WITHOUT COMMITTEE REFERENCE[For Adoption Boiler|B1,B2]', 'Items 72 through 77', '250785 Supporting the Golden State Valkyries in Equal Pay Compensation', '14 ADJOURNMENT']

def main():

    response = Summarizer(
        transcript_file_path="../transcripts/10_50523.txt",
        agenda_for_the_meetings=agendas,
        model_name=ModelName.GEMINI_2
    ).summarize()
    print(response)

if __name__ == '__main__':
    main()