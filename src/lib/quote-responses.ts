import { supabase } from '@/lib/supabase';

const QUOTE_RESPONSE_COLUMNS =
  'id, quote_request_id, contractor_id, proposed_price, timeline, message, created_at, updated_at';

export type QuoteResponse = {
  id: string;
  quoteRequestId: string;
  contractorId: string;
  proposedPrice: number;
  timeline: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type QuoteResponseInput = {
  quoteRequestId: string;
  contractorId: string;
  proposedPrice: number;
  timeline: string;
  message: string;
};

type QuoteResponseRow = {
  id: string;
  quote_request_id: string;
  contractor_id: string;
  proposed_price: number | string;
  timeline: string;
  message: string;
  created_at: string;
  updated_at: string;
};

function mapQuoteResponse(row: QuoteResponseRow): QuoteResponse {
  return {
    id: row.id,
    quoteRequestId: row.quote_request_id,
    contractorId: row.contractor_id,
    proposedPrice: Number(row.proposed_price),
    timeline: row.timeline,
    message: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getQuoteResponseForRequest(
  quoteRequestId: string,
): Promise<QuoteResponse | null> {
  const { data, error } = await supabase
    .from('quote_responses')
    .select(QUOTE_RESPONSE_COLUMNS)
    .eq('quote_request_id', quoteRequestId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapQuoteResponse(data as QuoteResponseRow) : null;
}

export async function getQuoteResponsesForRequests(
  quoteRequestIds: string[],
): Promise<QuoteResponse[]> {
  if (!quoteRequestIds.length) return [];

  const { data, error } = await supabase
    .from('quote_responses')
    .select(QUOTE_RESPONSE_COLUMNS)
    .in('quote_request_id', quoteRequestIds);

  if (error) {
    throw error;
  }

  return ((data ?? []) as QuoteResponseRow[]).map(mapQuoteResponse);
}

export async function saveQuoteResponse(
  input: QuoteResponseInput,
): Promise<QuoteResponse> {
  const existing = await getQuoteResponseForRequest(input.quoteRequestId);

  if (existing) {
    const { data, error } = await supabase
      .from('quote_responses')
      .update({
        proposed_price: input.proposedPrice,
        timeline: input.timeline.trim(),
        message: input.message.trim(),
      })
      .eq('id', existing.id)
      .select(QUOTE_RESPONSE_COLUMNS)
      .single();

    if (error) {
      throw error;
    }

    return mapQuoteResponse(data as QuoteResponseRow);
  }

  const { data, error } = await supabase
    .from('quote_responses')
    .insert({
      quote_request_id: input.quoteRequestId,
      contractor_id: input.contractorId,
      proposed_price: input.proposedPrice,
      timeline: input.timeline.trim(),
      message: input.message.trim(),
    })
    .select(QUOTE_RESPONSE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return mapQuoteResponse(data as QuoteResponseRow);
}
